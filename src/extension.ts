import * as vscode from 'vscode';
import * as path from 'path';
import { translateMarkdown } from './translator';
import { renderResultHtml, renderLoadingHtml, renderErrorHtml } from './webview';
import {
  Provider,
  PROVIDERS,
  getApiKey,
  storeApiKey,
  deleteApiKey
} from './secrets';

let panel: vscode.WebviewPanel | undefined;
let lastDocUri: vscode.Uri | undefined;
let lastTranslation: string | undefined;
let secrets: vscode.SecretStorage;

export function activate(context: vscode.ExtensionContext) {
  secrets = context.secrets;

  context.subscriptions.push(
    vscode.commands.registerCommand('llmTranslator.openPreview', () => openPreview()),
    vscode.commands.registerCommand('llmTranslator.refresh', () => {
      if (lastDocUri) {
        translateDocument(lastDocUri);
      } else {
        openPreview();
      }
    }),
    vscode.commands.registerCommand('llmTranslator.setApiKey', () => setApiKeyCommand()),
    vscode.commands.registerCommand('llmTranslator.clearApiKey', () => clearApiKeyCommand())
  );
}

/** 让用户选择服务商;默认选中当前配置的 provider。 */
async function pickProvider(placeHolder: string): Promise<Provider | undefined> {
  const current = vscode.workspace.getConfiguration('llmTranslator').get<string>('provider', 'deepseek');
  const labels: Record<Provider, string> = {
    deepseek: 'DeepSeek',
    openai: 'OpenAI (ChatGPT)',
    claude: 'Anthropic (Claude)'
  };
  const items = PROVIDERS.map((p) => ({
    label: labels[p],
    description: p === current ? '$(check) 当前服务商' : undefined,
    provider: p
  }));
  const picked = await vscode.window.showQuickPick(items, { placeHolder });
  return picked?.provider;
}

/** 命令:输入并保存某个服务商的 API Key(输入框以密码形式显示)。 */
async function setApiKeyCommand() {
  const provider = await pickProvider('选择要设置 API Key 的服务商');
  if (!provider) {
    return;
  }
  const apiKey = await vscode.window.showInputBox({
    title: `设置 ${provider} 的 API Key`,
    prompt: 'API Key 将被加密保存到系统密钥库,不会写入 settings.json',
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'sk-...'
  });
  if (apiKey === undefined) {
    return; // 用户取消
  }
  if (!apiKey.trim()) {
    vscode.window.showWarningMessage('未输入 API Key,已取消。');
    return;
  }
  await storeApiKey(secrets, provider, apiKey);
  vscode.window.showInformationMessage(`已加密保存 ${provider} 的 API Key。`);
}

/** 命令:删除某个服务商已保存的 API Key。 */
async function clearApiKeyCommand() {
  const provider = await pickProvider('选择要清除 API Key 的服务商');
  if (!provider) {
    return;
  }
  await deleteApiKey(secrets, provider);
  vscode.window.showInformationMessage(`已清除 ${provider} 的 API Key。`);
}

/**
 * 取出当前服务商的 API Key;若未设置则提示用户立即输入并保存。
 * 返回 undefined 表示用户放弃输入。
 */
async function resolveApiKey(provider: Provider): Promise<string | undefined> {
  const existing = await getApiKey(secrets, provider);
  if (existing) {
    return existing;
  }
  const apiKey = await vscode.window.showInputBox({
    title: `${provider} 尚未配置 API Key`,
    prompt: 'API Key 将被加密保存到系统密钥库,不会写入 settings.json',
    password: true,
    ignoreFocusOut: true,
    placeHolder: 'sk-...'
  });
  if (!apiKey?.trim()) {
    return undefined;
  }
  await storeApiKey(secrets, provider, apiKey);
  return apiKey.trim();
}

async function openPreview() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'markdown') {
    vscode.window.showWarningMessage('Please open a Markdown file before using the translation preview.');
    return;
  }
  await translateDocument(editor.document.uri);
}

async function translateDocument(uri: vscode.Uri) {
  lastDocUri = uri;

  const document = await vscode.workspace.openTextDocument(uri);
  const source = document.getText();
  const fileName = uri.path.split('/').pop() ?? 'README';

  const config = vscode.workspace.getConfiguration('llmTranslator');
  const provider = config.get<Provider>('provider', 'deepseek');
  const apiKey = await resolveApiKey(provider);
  if (!apiKey) {
    vscode.window.showWarningMessage(
      `未配置 ${provider} 的 API Key,无法翻译。可运行 "LLM Translator: Set API Key" 命令设置。`
    );
    return;
  }

  lastTranslation = undefined;

  ensurePanel();
  panel!.title = `Translation Preview: ${fileName}`;
  panel!.webview.html = renderLoadingHtml('Translating, please wait…');

  const controller = new AbortController();
  panel!.onDidDispose(() => controller.abort());

  try {
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Translating Markdown…',
        cancellable: true
      },
      (progress, token) => {
        token.onCancellationRequested(() => controller.abort());
        return translateMarkdown(source, config, apiKey, {
          signal: controller.signal,
          onProgress: (done, total) => {
            progress.report({ message: `Chunk ${done}/${total}`, increment: 100 / total });
          }
        });
      }
    );

    lastTranslation = result;
    if (panel) {
      panel.webview.html = renderResultHtml(result);
    }
  } catch (err: any) {
    const message = err?.message ?? String(err);
    if (panel) {
      panel.webview.html = renderErrorHtml(message);
    }
    vscode.window.showErrorMessage(`Translation failed: ${message}`);
  }
}

function ensurePanel() {
  if (panel) {
    panel.reveal(vscode.ViewColumn.Beside, true);
    return;
  }
  panel = vscode.window.createWebviewPanel(
    'llmTranslatorPreview',
    'Translation Preview',
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    { enableScripts: true, retainContextWhenHidden: true }
  );
  // 处理预览页内浮动按钮发来的消息(刷新 / 保存)。
  panel.webview.onDidReceiveMessage((msg) => {
    if (msg?.command === 'save') {
      saveTranslation();
    } else if (msg?.command === 'refresh') {
      if (lastDocUri) {
        translateDocument(lastDocUri);
      }
    }
  });
  panel.onDidDispose(() => {
    panel = undefined;
  });
}

/**
 * 将翻译结果保存到源文件同级目录,文件名为「源文件名.目标语言.扩展名」。
 * 例如 README.md 翻译成中文后保存为 README.中文.md。
 */
async function saveTranslation() {
  if (!lastTranslation || !lastDocUri) {
    vscode.window.showWarningMessage('暂无可保存的翻译结果,请先完成一次翻译。');
    return;
  }

  const targetLanguage = vscode.workspace
    .getConfiguration('llmTranslator')
    .get<string>('targetLanguage', '中文')
    .trim();
  // 过滤掉文件名中的非法字符,避免目标语言里含有 \ / : * ? " < > | 等
  const suffix = targetLanguage.replace(/[\\/:*?"<>|]/g, '_') || 'translated';

  const dir = path.dirname(lastDocUri.fsPath);
  const ext = path.extname(lastDocUri.fsPath);
  const base = path.basename(lastDocUri.fsPath, ext);
  const targetUri = vscode.Uri.file(path.join(dir, `${base}.${suffix}${ext}`));

  // 若目标文件已存在,先确认是否覆盖
  let exists = false;
  try {
    await vscode.workspace.fs.stat(targetUri);
    exists = true;
  } catch {
    exists = false;
  }
  if (exists) {
    const choice = await vscode.window.showWarningMessage(
      `文件 ${path.basename(targetUri.fsPath)} 已存在,是否覆盖?`,
      { modal: true },
      '覆盖'
    );
    if (choice !== '覆盖') {
      return;
    }
  }

  try {
    await vscode.workspace.fs.writeFile(targetUri, Buffer.from(lastTranslation, 'utf8'));
    const open = await vscode.window.showInformationMessage(
      `已保存翻译结果到 ${path.basename(targetUri.fsPath)}`,
      '打开'
    );
    if (open === '打开') {
      const doc = await vscode.workspace.openTextDocument(targetUri);
      await vscode.window.showTextDocument(doc);
    }
  } catch (err: any) {
    vscode.window.showErrorMessage(`保存失败:${err?.message ?? String(err)}`);
  }
}

export function deactivate() {
  panel?.dispose();
}
