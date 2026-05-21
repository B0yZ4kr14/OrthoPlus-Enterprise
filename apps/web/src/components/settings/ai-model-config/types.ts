// cspell:disable

export interface AIModelConfig {
  default_provider?: string;
  openai_api_key?: string;
  google_api_key?: string;
  anthropic_api_key?: string;
  openrouter_api_key?: string;
  huggingface_api_key?: string;
  default_model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AIProvider {
  id: string;
  name: string;
  free: boolean;
  models: string[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "local",
    name: "Local / Self-Hosted",
    free: true,
    models: [
      "local/llama-3.3",
      "local/qwen-2.5",
      "local/deepseek-r1",
    ],
  },
  {
    id: "openai",
    name: "ChatGPT (OpenAI)",
    free: false,
    models: ["gpt-5", "gpt-5-mini", "gpt-5-nano"],
  },
  {
    id: "google",
    name: "Gemini Pro (Google)",
    free: false,
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
  },
  {
    id: "anthropic",
    name: "Claude Pro (Anthropic)",
    free: false,
    models: ["claude-sonnet-4-5", "claude-opus-4-1"],
  },
  {
    id: "openrouter",
    name: "OpenRouter.ai",
    free: false,
    models: ["múltiplos modelos"],
  },
  {
    id: "huggingface",
    name: "HuggingFace",
    free: false,
    models: ["múltiplos modelos"],
  },
];

export type ApiKeyField = {
  key: keyof AIModelConfig;
  label: string;
  placeholder: string;
  url: string;
  urlLabel: string;
};

export const API_KEY_FIELDS: ApiKeyField[] = [
  {
    key: "openai_api_key",
    label: "OpenAI API Key (ChatGPT)",
    placeholder: "sk-proj-*********************",
    url: "https://platform.openai.com/api-keys",
    urlLabel: "platform.openai.com",
  },
  {
    key: "google_api_key",
    label: "Google AI API Key (Gemini Pro)",
    placeholder: "AIzaSy*********************",
    url: "https://makersuite.google.com/app/apikey",
    urlLabel: "makersuite.google.com",
  },
  {
    key: "anthropic_api_key",
    label: "Anthropic API Key (Claude Pro)",
    placeholder: "sk-ant-*********************",
    url: "https://console.anthropic.com/settings/keys",
    urlLabel: "console.anthropic.com",
  },
  {
    key: "openrouter_api_key",
    label: "OpenRouter API Key",
    placeholder: "sk-or-*********************",
    url: "https://openrouter.ai/keys",
    urlLabel: "openrouter.ai",
  },
  {
    key: "huggingface_api_key",
    label: "HuggingFace API Key",
    placeholder: "hf_*********************",
    url: "https://huggingface.co/settings/tokens",
    urlLabel: "huggingface.co",
  },
];
