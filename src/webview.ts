import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false
});

/** 把翻译后的 Markdown 渲染成完整的 HTML 预览页面。 */
export function renderResultHtml(markdown: string): string {
  const body = md.render(markdown);
  return wrapHtml(body);
}

/** 加载中页面。 */
export function renderLoadingHtml(message: string): string {
  return wrapHtml(`
    <div class="status">
      <div class="spinner"></div>
      <p>${escapeHtml(message)}</p>
    </div>
  `);
}

/** 错误页面。 */
export function renderErrorHtml(message: string): string {
  return wrapHtml(`
    <div class="status error">
      <h3>❌ Translation failed</h3>
      <pre>${escapeHtml(message)}</pre>
    </div>
  `);
}

function wrapHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  body {
    font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
    line-height: 1.6;
    padding: 24px 32px;
    max-width: 900px;
    margin: 0 auto;
    color: var(--vscode-editor-foreground);
  }
  h1, h2 { border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: .3em; }
  code {
    background: var(--vscode-textCodeBlock-background);
    padding: .2em .4em;
    border-radius: 4px;
    font-size: 85%;
  }
  pre {
    background: var(--vscode-textCodeBlock-background);
    padding: 16px;
    border-radius: 6px;
    overflow: auto;
  }
  pre code { background: none; padding: 0; }
  a { color: var(--vscode-textLink-foreground); }
  blockquote {
    border-left: 4px solid var(--vscode-panel-border);
    margin: 0;
    padding-left: 16px;
    color: var(--vscode-descriptionForeground);
  }
  table { border-collapse: collapse; }
  th, td { border: 1px solid var(--vscode-panel-border); padding: 6px 12px; }
  img { max-width: 100%; }
  .status { text-align: center; padding: 60px 0; color: var(--vscode-descriptionForeground); }
  .status.error { text-align: left; }
  .status pre { white-space: pre-wrap; color: var(--vscode-errorForeground); }
  .spinner {
    width: 36px; height: 36px;
    border: 4px solid var(--vscode-panel-border);
    border-top-color: var(--vscode-textLink-foreground);
    border-radius: 50%;
    margin: 0 auto 16px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
