**中文** | [English](README.en.md)

# LLM Translator

用大模型(DeepSeek / OpenAI / Claude)翻译 Markdown 文件,并在侧边预览窗口中查看渲染后的结果——无需离开编辑器。

## 功能特性

- 一键翻译当前正在编辑的 Markdown 文件。
- 自由选择服务商:**DeepSeek**、**OpenAI(ChatGPT)**、**Anthropic(Claude)**。
- 可翻译成任意目标语言(中文、英文、阿拉伯语……)。
- 长文档自动分段翻译,完整保留 Markdown 语法、代码块、链接和图片。
- 预览窗口随 VS Code 主题自动适配明暗配色。

## 快速开始

1. 打开**设置**(`Ctrl+,` / `Cmd+,`),搜索 **LLM Translator**。
2. 在 `LLM Translator: Provider` 选择服务商,并填入对应的 **API Key**:
   - DeepSeek → `llmTranslator.deepseek.apiKey`
   - OpenAI → `llmTranslator.openai.apiKey`
   - Claude → `llmTranslator.claude.apiKey`
3. 如需更改翻译目标语言,设置 `LLM Translator: Target Language`。
4. 打开任意 `.md` 文件,按下方方式启动预览。

## 使用方法

在打开的 Markdown 文件中,通过以下任一方式启动翻译预览:

- 点击编辑器右上角工具栏的 🌐 图标。
- 按下 `Ctrl+Shift+\`。
- 在命令面板(`Ctrl+Shift+P`)中运行 **LLM Translator: Open Translation Preview**。

翻译并渲染后的 Markdown 会显示在编辑器旁边的窗口中。需要刷新时,运行 **LLM Translator: Re-translate**。

## 配置项

| 配置 | 说明 | 默认值 |
| --- | --- | --- |
| `llmTranslator.provider` | 服务商:`deepseek` / `openai` / `claude` | `deepseek` |
| `llmTranslator.targetLanguage` | 目标语言 | `中文` |
| `llmTranslator.deepseek.apiKey` / `.model` / `.baseUrl` | DeepSeek 凭据与模型 | `deepseek-v4-flash` |
| `llmTranslator.openai.apiKey` / `.model` / `.baseUrl` | OpenAI 凭据与模型 | `gpt-4.1-mini` |
| `llmTranslator.claude.apiKey` / `.model` / `.baseUrl` | Claude 凭据与模型 | `claude-sonnet-4-6` |

> 需要先在所选服务商处获取 API Key。`baseUrl` 配置可指向兼容的代理或网关。

## 环境要求

- VS Code 1.85 或更高版本。
- 至少一个受支持服务商的 API Key。

## 许可证

[MIT](LICENSE)
