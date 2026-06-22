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

1. 打开**设置**(`Ctrl+,` / `Cmd+,`),搜索 **LLM Translator**,在 `LLM Translator: Provider` 选择服务商。
2. 在命令面板(`Ctrl+Shift+P`)运行 **LLM Translator: Set API Key**,选择服务商并粘贴对应的 **API Key**。Key 会被**加密保存到系统密钥库**,不会写入 `settings.json`,因此不会随设置同步/提交而泄露。
   - 也可以直接打开预览,首次翻译时会提示输入 Key。
   - 如需删除已保存的 Key,运行 **LLM Translator: Clear API Key**。
3. 如需更改翻译目标语言,设置 `LLM Translator: Target Language`。
4. 打开任意 `.md` 文件,按下方方式启动预览。

## 使用方法

在打开的 Markdown 文件中,通过以下任一方式启动翻译预览:

- 点击编辑器右上角工具栏的 🌐 图标。
- 按下 `Ctrl+Shift+\`。
- 在命令面板(`Ctrl+Shift+P`)中运行 **LLM Translator: Open Translation Preview**。

翻译并渲染后的 Markdown 会显示在编辑器旁边的窗口中。需要刷新时,运行 **LLM Translator: Re-translate**。

## 管理 API Key

API Key 通过命令面板设置和删除,不在普通设置里填写,这样不会以明文形式留在 `settings.json` 中。

### 设置 API Key

1. **打开命令面板**:同时按下 `Ctrl` + `Shift` + `P`(Mac 上是 `Cmd` + `Shift` + `P`),窗口顶部中间会出现一个输入框。
2. **输入命令**:在输入框里打字 `Set API Key`(打 `set api` 即可),下方会出现 **LLM Translator: Set API Key**,点它或按 `回车`。
3. **选择服务商**:在弹出的列表里点 DeepSeek / OpenAI (ChatGPT) / Anthropic (Claude) 之一。
4. **粘贴 Key**:在输入框里粘贴你的 API Key(输入内容会以圆点遮挡),按 `回车`。
5. 右下角提示「已加密保存」即完成。

> 也可以跳过以上步骤:直接打开预览,首次翻译时会自动弹出输入框让你填 Key。

### 清除 API Key

1. **打开命令面板**:同时按下 `Ctrl` + `Shift` + `P`(Mac 上是 `Cmd` + `Shift` + `P`)。
2. **输入命令**:在输入框里打字 `Clear API Key`(打 `clear api` 即可),下方会出现 **LLM Translator: Clear API Key**,点它或按 `回车`。
3. **选择服务商**:在弹出的列表里点你想删除 Key 的那个服务商。
4. 右下角提示「已清除」即完成。

> 这两个命令在菜单栏和右键菜单里没有按钮,只能通过命令面板(第 1 步的快捷键)运行,这是 VS Code 插件的常规做法。

## 配置项

| 配置 | 说明 | 默认值 |
| --- | --- | --- |
| `llmTranslator.provider` | 服务商:`deepseek` / `openai` / `claude` | `deepseek` |
| `llmTranslator.targetLanguage` | 目标语言 | `中文` |
| `llmTranslator.deepseek.model` / `.baseUrl` | DeepSeek 模型与接口地址 | `deepseek-v4-flash` |
| `llmTranslator.openai.model` / `.baseUrl` | OpenAI 模型与接口地址 | `gpt-4.1-mini` |
| `llmTranslator.claude.model` / `.baseUrl` | Claude 模型与接口地址 | `claude-sonnet-4-6` |

> API Key 不在设置中配置,而是通过 **LLM Translator: Set API Key** 命令加密保存。`baseUrl` 配置可指向兼容的代理或网关。

## 环境要求

- VS Code 1.85 或更高版本。
- 至少一个受支持服务商的 API Key。

## 许可证

[MIT](LICENSE)
