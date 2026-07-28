[中文](README.md) | **English**

# LLM Translator

Translate Markdown files with popular LLM APIs and view the rendered result in a side preview pane — without leaving your editor.

## Features

- One-click translation of the Markdown file you're editing.
- Supports DeepSeek, OpenAI, Claude, GLM, Qwen, Kimi, Gemini, Doubao, MiniMax, and custom OpenAI-compatible services.
- Translate into any target language (Chinese, English, Arabic, …).
- Long documents are split into chunks automatically, preserving Markdown syntax, code blocks, links, and images.
- The preview pane follows your VS Code color theme (light / dark).
- Built-in **refresh** and **save** buttons in the preview: re-translate in one click, or save the translation next to the source file.

## Getting Started

1. Open **Settings** (`Ctrl+,` / `Cmd+,`), search for **LLM Translator**, and pick your provider in `LLM Translator: Provider`.
2. Run **LLM Translator: Set API Key** from the Command Palette (`Ctrl+Shift+P`), choose the provider, and paste the matching **API key**. The key is **stored encrypted in your OS keychain** — it is never written to `settings.json`, so it can't leak through settings sync or commits.
   - You can also just open the preview; on first run you'll be prompted for the key.
   - Run **LLM Translator: Clear API Key** to remove a stored key.
3. Set `LLM Translator: Target Language` if you don't want the default.
4. Open any `.md` file and start the preview (see below).

## Usage

With a Markdown file open, start the translation preview in any of these ways:

- Click the 🌐 icon in the editor's top-right toolbar.
- Press `Ctrl+Shift+\`.
- Run **LLM Translator: Open Translation Preview** from the Command Palette (`Ctrl+Shift+P`).

The translated, rendered Markdown opens in a pane beside your editor.

### Refresh and save

Move your mouse over the preview pane and two buttons fade in at the top-right corner:

- 🔄 **Refresh**: re-translate the current file and refresh the preview (you can also run **LLM Translator: Re-translate**).
- 💾 **Save**: save the translation next to the source file, named `<source>.<targetLanguage>.<ext>` — e.g. `README.md` becomes `README.中文.md` when the target language is `中文`. If the target file already exists you're asked to confirm overwrite, and you can open it right after saving.

## Managing your API key

API keys are set and removed through the Command Palette rather than the regular Settings UI, so they never sit in plain text inside `settings.json`.

### Set an API key

1. **Open the Command Palette**: press `Ctrl` + `Shift` + `P` (`Cmd` + `Shift` + `P` on Mac). An input box appears at the top of the window.
2. **Type the command**: type `Set API Key` (typing `set api` is enough); **LLM Translator: Set API Key** shows up below — click it or press `Enter`.
3. **Pick a provider** from the list.
4. **Paste the key**: paste your API key into the input box (it's masked with dots) and press `Enter`.
5. A "saved (encrypted)" message in the bottom-right confirms it's done.

> You can also skip this: just open the preview, and on the first translation a box pops up asking for the key.

### Clear an API key

1. **Open the Command Palette**: press `Ctrl` + `Shift` + `P` (`Cmd` + `Shift` + `P` on Mac).
2. **Type the command**: type `Clear API Key` (typing `clear api` is enough); **LLM Translator: Clear API Key** shows up below — click it or press `Enter`.
3. **Pick a provider**: choose the provider whose key you want to delete.
4. A confirmation message in the bottom-right means it's removed.

> These two commands have no toolbar or right-click button — they're only available from the Command Palette (the shortcut in step 1), which is standard for VS Code extensions.

## Settings

| Setting | Description | Default |
| --- | --- | --- |
| `llmTranslator.provider` | Provider: `deepseek` / `openai` / `claude` / `glm` / `qwen` / `kimi` / `custom` / `gemini` / `doubao` / `minimax` | `deepseek` |
| `llmTranslator.targetLanguage` | Target language | `中文` |
| `llmTranslator.deepseek.model` / `.baseUrl` | DeepSeek model and endpoint | `deepseek-v4-flash` |
| `llmTranslator.openai.model` / `.baseUrl` | OpenAI model and endpoint | `gpt-4.1-mini` |
| `llmTranslator.claude.model` / `.baseUrl` | Claude model and endpoint | `claude-sonnet-4-6` |
| `llmTranslator.glm.model` / `.baseUrl` | GLM model and endpoint | `glm-4.7-flash` |
| `llmTranslator.qwen.model` / `.baseUrl` | Qwen model and endpoint | `qwen-plus` |
| `llmTranslator.kimi.model` / `.baseUrl` | Kimi model and endpoint | `kimi-k2.6` |
| `llmTranslator.custom.model` / `.baseUrl` | Custom OpenAI-compatible model and endpoint | None |
| `llmTranslator.gemini.model` / `.baseUrl` | Gemini model and endpoint | `gemini-3.6-flash` |
| `llmTranslator.doubao.model` / `.baseUrl` | Doubao model and endpoint | `doubao-seed-2-0-lite-260215` |
| `llmTranslator.minimax.model` / `.baseUrl` | MiniMax model and endpoint | `MiniMax-M2.7` |

> API keys are not configured in settings — set them via the **LLM Translator: Set API Key** command, which stores them encrypted. The `baseUrl` settings let you point at a compatible proxy or gateway if needed.

## Requirements

- VS Code 1.85 or newer.
- An API key for at least one supported provider.

## License

[MIT](LICENSE)
