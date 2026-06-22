[中文](README.md) | **English**

# LLM Translator

Translate Markdown files with large language models (DeepSeek / OpenAI / Claude) and view the rendered result in a side preview pane — without leaving your editor.

## Features

- One-click translation of the Markdown file you're editing.
- Choose your provider: **DeepSeek**, **OpenAI (ChatGPT)**, or **Anthropic (Claude)**.
- Translate into any target language (Chinese, English, Arabic, …).
- Long documents are split into chunks automatically, preserving Markdown syntax, code blocks, links, and images.
- The preview pane follows your VS Code color theme (light / dark).

## Getting Started

1. Open **Settings** (`Ctrl+,` / `Cmd+,`) and search for **LLM Translator**.
2. Pick your provider in `LLM Translator: Provider` and paste the matching **API key**:
   - DeepSeek → `llmTranslator.deepseek.apiKey`
   - OpenAI → `llmTranslator.openai.apiKey`
   - Claude → `llmTranslator.claude.apiKey`
3. Set `LLM Translator: Target Language` if you don't want the default.
4. Open any `.md` file and start the preview (see below).

## Usage

With a Markdown file open, start the translation preview in any of these ways:

- Click the 🌐 icon in the editor's top-right toolbar.
- Press `Ctrl+Shift+\`.
- Run **LLM Translator: Open Translation Preview** from the Command Palette (`Ctrl+Shift+P`).

The translated, rendered Markdown opens in a pane beside your editor. Use **LLM Translator: Re-translate** to refresh it.

## Settings

| Setting | Description | Default |
| --- | --- | --- |
| `llmTranslator.provider` | Provider: `deepseek` / `openai` / `claude` | `deepseek` |
| `llmTranslator.targetLanguage` | Target language | `中文` |
| `llmTranslator.deepseek.apiKey` / `.model` / `.baseUrl` | DeepSeek credentials and model | `deepseek-v4-flash` |
| `llmTranslator.openai.apiKey` / `.model` / `.baseUrl` | OpenAI credentials and model | `gpt-4.1-mini` |
| `llmTranslator.claude.apiKey` / `.model` / `.baseUrl` | Claude credentials and model | `claude-sonnet-4-6` |

> You need an API key from your chosen provider. The `baseUrl` settings let you point at a compatible proxy or gateway if needed.

## Requirements

- VS Code 1.85 or newer.
- An API key for at least one supported provider.

## License

[MIT](LICENSE)
