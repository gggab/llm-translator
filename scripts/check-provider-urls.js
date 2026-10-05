const assert = require('node:assert/strict');
const { chatCompletionsUrl } = require('../out/provider-url');
const { renderResultHtml } = require('../out/webview');

assert.equal(
  chatCompletionsUrl('glm', 'https://open.bigmodel.cn/api/paas'),
  'https://open.bigmodel.cn/api/paas/v4/chat/completions'
);
assert.equal(
  chatCompletionsUrl('custom', 'https://api.siliconflow.cn/v1/'),
  'https://api.siliconflow.cn/v1/chat/completions'
);
assert.equal(
  chatCompletionsUrl('gemini', 'https://generativelanguage.googleapis.com'),
  'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
);
assert.equal(
  chatCompletionsUrl('doubao', 'https://ark.cn-beijing.volces.com'),
  'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
);
assert.equal(
  chatCompletionsUrl('minimax', 'https://api.minimaxi.com'),
  'https://api.minimaxi.com/v1/chat/completions'
);
assert.equal(
  chatCompletionsUrl('grok', 'https://api.x.ai/'),
  'https://api.x.ai/v1/chat/completions'
);

const preview = renderResultHtml('# translated', 'DeepSeek <model>', '中文');
assert.match(preview, /command: 'pickProvider'/);
assert.match(preview, /command: 'pickLanguage'/);
assert.match(preview, /DeepSeek &lt;model&gt;/);

async function checkTranslationRequests() {
  const { translateMarkdown } = require('../out/translator');
  const { PROVIDERS, storeApiKey, getApiKey, deleteApiKey } = require('../out/secrets');
  const properties = require('../package.json').contributes.configuration.properties;
  assert.deepEqual(PROVIDERS, properties['llmTranslator.provider'].enum);
  assert.ok(PROVIDERS.includes('grok'));

  const originalFetch = global.fetch;
  let request;
  global.fetch = async (url, options) => {
    request = { url, options, body: JSON.parse(options.body) };
    return { ok: true, json: async () => ({ choices: [{ message: { content: ' # translated\n' } }] }) };
  };
  try {
    for (const [provider, model, reasoning, thinking, temperature] of [
      ['grok', 'grok-4.3', 'none', undefined, 0.2],
      ['openai', 'gpt-6-luna', 'none', undefined, 0.2],
      ['kimi', 'kimi-k2.6', undefined, 'disabled', undefined],
      ['deepseek', 'deepseek-flash', undefined, 'disabled', 0.2],
      ['minimax', 'MiniMax-M3', undefined, 'disabled', 0.2],
      ['openai', 'gpt-4.1-mini', undefined, undefined, 0.2],
      ['grok', 'grok-4.7', undefined, undefined, 0.2],
      ['custom', 'gpt-6-luna', undefined, undefined, 0.2]
    ]) {
      const config = {
        get: (key, fallback) => key === 'provider' ? provider
          : key === `${provider}.model` ? model
          : key === 'custom.baseUrl' ? 'https://gateway.example/v1'
          : properties[`llmTranslator.${key}`]?.default ?? fallback
      };
      assert.equal(await translateMarkdown('# original', config, 'test-key'), '# translated');
      assert.equal(request.body.model, model);
      assert.equal(request.body.reasoning_effort, reasoning);
      assert.equal(request.body.thinking?.type, thinking);
      assert.equal(request.body.temperature, temperature);
      assert.equal(request.body.messages[1].content, '# original');
      assert.equal(request.options.headers.Authorization, 'Bearer test-key');
      if (provider === 'grok') {
        assert.equal(request.url, 'https://api.x.ai/v1/chat/completions');
        const previousRequest = request;
        await assert.rejects(translateMarkdown('# original', config, ''), /No API key configured for grok/);
        assert.equal(request, previousRequest);
      }
    }
  } finally {
    global.fetch = originalFetch;
  }

  const values = new Map();
  const secrets = {
    store: async (key, value) => values.set(key, value),
    get: async (key) => values.get(key),
    delete: async (key) => values.delete(key)
  };
  await storeApiKey(secrets, 'grok', ' test-key ');
  assert.equal(values.get('llmTranslator.grok.apiKey'), 'test-key');
  assert.equal(await getApiKey(secrets, 'grok'), 'test-key');
  await deleteApiKey(secrets, 'grok');
  assert.equal(await getApiKey(secrets, 'grok'), undefined);
}

checkTranslationRequests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
