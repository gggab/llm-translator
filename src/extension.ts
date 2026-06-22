import * as vscode from 'vscode';
import { translateMarkdown } from './translator';
import { renderResultHtml, renderLoadingHtml, renderErrorHtml } from './webview';

let panel: vscode.WebviewPanel | undefined;
let lastDocUri: vscode.Uri | undefined;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('llmTranslator.openPreview', () => openPreview()),
    vscode.commands.registerCommand('llmTranslator.refresh', () => {
      if (lastDocUri) {
        translateDocument(lastDocUri);
      } else {
        openPreview();
      }
    })
  );
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

  ensurePanel();
  panel!.title = `Translation Preview: ${fileName}`;
  panel!.webview.html = renderLoadingHtml('Translating, please wait…');

  const controller = new AbortController();
  panel!.onDidDispose(() => controller.abort());

  try {
    const config = vscode.workspace.getConfiguration('llmTranslator');
    const result = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Translating Markdown…',
        cancellable: true
      },
      (progress, token) => {
        token.onCancellationRequested(() => controller.abort());
        return translateMarkdown(source, config, {
          signal: controller.signal,
          onProgress: (done, total) => {
            progress.report({ message: `Chunk ${done}/${total}`, increment: 100 / total });
          }
        });
      }
    );

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
    { enableScripts: false, retainContextWhenHidden: true }
  );
  panel.onDidDispose(() => {
    panel = undefined;
  });
}

export function deactivate() {
  panel?.dispose();
}
