import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: false
});

/** 把翻译后的 Markdown 渲染成完整的 HTML 预览页面。 */
export function renderResultHtml(
  markdown: string,
  model: string,
  targetLanguage: string
): string {
  const body = md.render(markdown);
  return wrapHtml(renderActions(model, targetLanguage) + body);
}

function renderActions(model: string, targetLanguage: string): string {
  return `
    <div class="actions" id="actions">
      <button class="action-btn setting-btn" id="provider-btn" title="切换大模型" aria-label="切换大模型">
        <span class="action-label">模型</span><span class="action-value">${escapeHtml(model)}</span>
      </button>
      <button class="action-btn setting-btn" id="language-btn" title="切换目标语言" aria-label="切换目标语言">
        <span class="action-label">语言</span><span class="action-value">${escapeHtml(targetLanguage)}</span>
      </button>
      <button class="action-btn" id="refresh-btn" title="重新翻译">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
      </button>
      <button class="action-btn" id="save-btn" title="保存翻译结果">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      </button>
    </div>
    <script>
      const vscode = acquireVsCodeApi();
      const actions = document.getElementById('actions');
      document.getElementById('provider-btn').addEventListener('click', () => vscode.postMessage({ command: 'pickProvider' }));
      document.getElementById('language-btn').addEventListener('click', () => vscode.postMessage({ command: 'pickLanguage' }));
      document.getElementById('refresh-btn').addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));
      document.getElementById('save-btn').addEventListener('click', () => vscode.postMessage({ command: 'save' }));
      // 鼠标进入预览页时显示按钮,离开时淡出
      document.addEventListener('mouseenter', () => actions.classList.add('visible'));
      document.addEventListener('mouseleave', () => actions.classList.remove('visible'));
    </script>
  `;
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
export function renderErrorHtml(message: string, model: string, targetLanguage: string): string {
  return wrapHtml(renderActions(model, targetLanguage) + `
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
  .actions {
    position: fixed;
    top: 12px;
    right: 16px;
    display: flex;
    gap: 4px;
    padding: 4px;
    border-radius: 6px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
    border: 1px solid var(--vscode-panel-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
    z-index: 10;
  }
  .actions.visible { opacity: 1; pointer-events: auto; }
  .actions:hover { opacity: 1; pointer-events: auto; }
  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, var(--vscode-editor-foreground));
    background: transparent;
  }
  .action-btn:hover { background: var(--vscode-toolbar-hoverBackground, var(--vscode-list-hoverBackground)); }
  .setting-btn {
    width: auto;
    max-width: 260px;
    padding: 0 8px;
    gap: 6px;
  }
  .action-label { color: var(--vscode-descriptionForeground); }
  .action-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
