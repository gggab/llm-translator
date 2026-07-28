const assert = require('node:assert/strict');
const { chatCompletionsUrl } = require('../out/provider-url');

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
