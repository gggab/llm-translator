import * as vscode from 'vscode';

export interface TranslateOptions {
  signal?: AbortSignal;
  onProgress?: (done: number, total: number) => void;
}

/**
 * 把整篇 Markdown 翻译成目标语言。
 * 长文本会按段落切块,逐块翻译后再拼接,避免超出模型上下文/输出长度。
 */
export async function translateMarkdown(
  source: string,
  config: vscode.WorkspaceConfiguration,
  opts: TranslateOptions = {}
): Promise<string> {
  const provider = config.get<string>('provider', 'deepseek');
  const targetLanguage = config.get<string>('targetLanguage', '中文');

  const chunks = splitMarkdown(source, 3500);
  const results: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (opts.signal?.aborted) {
      throw new Error('Cancelled');
    }
    const translated = await callProvider(provider, config, targetLanguage, chunks[i], opts.signal);
    results.push(translated);
    opts.onProgress?.(i + 1, chunks.length);
  }

  return results.join('\n\n');
}

/** 调度到具体的服务商实现。 */
async function callProvider(
  provider: string,
  config: vscode.WorkspaceConfiguration,
  targetLanguage: string,
  text: string,
  signal?: AbortSignal
): Promise<string> {
  const systemPrompt =
    `You are a professional technical-documentation translator. Translate the user's Markdown content into ${targetLanguage}. ` +
    `Strictly preserve all Markdown syntax, code blocks, links, images, HTML tags, and placeholders. ` +
    `Do not translate code inside code blocks (only translate comments). Do not add any explanation — output only the translated Markdown.`;

  switch (provider) {
    case 'claude':
      return callClaude(config, systemPrompt, text, signal);
    case 'openai':
      return callOpenAICompatible(config, 'openai', systemPrompt, text, signal);
    case 'deepseek':
    default:
      return callOpenAICompatible(config, 'deepseek', systemPrompt, text, signal);
  }
}

/** DeepSeek 与 OpenAI 都使用 OpenAI 兼容的 /v1/chat/completions 接口。 */
async function callOpenAICompatible(
  config: vscode.WorkspaceConfiguration,
  key: 'openai' | 'deepseek',
  systemPrompt: string,
  text: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = config.get<string>(`${key}.apiKey`, '').trim();
  const model = config.get<string>(`${key}.model`, '');
  const baseUrl = config.get<string>(`${key}.baseUrl`, '').replace(/\/+$/, '');

  if (!apiKey) {
    throw new Error(`No API key configured for ${key}. Please set llmTranslator.${key}.apiKey in settings.`);
  }

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ]
    }),
    signal
  });

  if (!res.ok) {
    throw new Error(`${key} API returned ${res.status}: ${await safeText(res)}`);
  }

  const data: any = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string') {
    throw new Error(`${key} returned an unexpected response format.`);
  }
  return content.trim();
}

/** Anthropic Claude 使用 /v1/messages 接口。 */
async function callClaude(
  config: vscode.WorkspaceConfiguration,
  systemPrompt: string,
  text: string,
  signal?: AbortSignal
): Promise<string> {
  const apiKey = config.get<string>('claude.apiKey', '').trim();
  const model = config.get<string>('claude.model', 'claude-sonnet-4-6');
  const baseUrl = config.get<string>('claude.baseUrl', 'https://api.anthropic.com').replace(/\/+$/, '');

  if (!apiKey) {
    throw new Error('No API key configured for Claude. Please set llmTranslator.claude.apiKey in settings.');
  }

  const res = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: 'user', content: text }]
    }),
    signal
  });

  if (!res.ok) {
    throw new Error(`Claude API returned ${res.status}: ${await safeText(res)}`);
  }

  const data: any = await res.json();
  const content = data?.content?.[0]?.text;
  if (typeof content !== 'string') {
    throw new Error('Claude returned an unexpected response format.');
  }
  return content.trim();
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return '(failed to read response body)';
  }
}

/**
 * 按空行把 Markdown 切成段落,再贪心地合并到不超过 maxChars 的块。
 * 避免在代码块中间切断:遇到 ``` 时会把整段代码块作为一个不可分割单元。
 */
function splitMarkdown(source: string, maxChars: number): string[] {
  const blocks = source.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = '';

  for (const block of blocks) {
    if (current.length + block.length + 2 > maxChars && current.length > 0) {
      chunks.push(current);
      current = '';
    }
    current += (current ? '\n\n' : '') + block;
  }
  if (current.trim()) {
    chunks.push(current);
  }
  return chunks.length ? chunks : [source];
}
