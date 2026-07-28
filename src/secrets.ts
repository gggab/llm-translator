import * as vscode from 'vscode';
import type { OpenAICompatibleProvider } from './provider-url';

export type Provider = OpenAICompatibleProvider | 'claude';

export const PROVIDERS: Provider[] = [
  'deepseek',
  'openai',
  'claude',
  'glm',
  'qwen',
  'kimi',
  'custom',
  'gemini',
  'doubao',
  'minimax'
];

/** SecretStorage 中保存 API Key 的键名。 */
function secretKey(provider: Provider): string {
  return `llmTranslator.${provider}.apiKey`;
}

/** 从加密的 SecretStorage 中读取指定服务商的 API Key。 */
export async function getApiKey(
  secrets: vscode.SecretStorage,
  provider: Provider
): Promise<string | undefined> {
  const value = await secrets.get(secretKey(provider));
  return value?.trim() || undefined;
}

/** 把 API Key 写入加密的 SecretStorage。 */
export async function storeApiKey(
  secrets: vscode.SecretStorage,
  provider: Provider,
  apiKey: string
): Promise<void> {
  await secrets.store(secretKey(provider), apiKey.trim());
}

/** 从 SecretStorage 中删除指定服务商的 API Key。 */
export async function deleteApiKey(
  secrets: vscode.SecretStorage,
  provider: Provider
): Promise<void> {
  await secrets.delete(secretKey(provider));
}
