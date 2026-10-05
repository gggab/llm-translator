export type OpenAICompatibleProvider =
  | 'deepseek'
  | 'openai'
  | 'glm'
  | 'qwen'
  | 'kimi'
  | 'custom'
  | 'gemini'
  | 'doubao'
  | 'minimax'
  | 'grok';

const CHAT_COMPLETIONS_PATHS: Record<OpenAICompatibleProvider, string> = {
  deepseek: 'v1/chat/completions',
  openai: 'v1/chat/completions',
  glm: 'v4/chat/completions',
  qwen: 'v1/chat/completions',
  kimi: 'v1/chat/completions',
  custom: 'chat/completions',
  gemini: 'v1beta/openai/chat/completions',
  doubao: 'api/v3/chat/completions',
  minimax: 'v1/chat/completions',
  grok: 'v1/chat/completions'
};

export function chatCompletionsUrl(provider: OpenAICompatibleProvider, baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${CHAT_COMPLETIONS_PATHS[provider]}`;
}
