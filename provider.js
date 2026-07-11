import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

// One factory per provider, each returning something that satisfies the
// LanguageModel type generateText() expects. Adding a provider means
// adding one entry here — nothing else in the app changes.
const factories = {
  openai: () => createOpenAI({ apiKey: process.env.OPENAI_API_KEY })('gpt-4o'),
  anthropic: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })('claude-sonnet-4-5'),
  // Fake provider: real createOpenAI() factory pointed at a local mock
  // server via baseURL. Proves the switch mechanism works on ANY
  // OpenAI-compatible endpoint, not just OpenAI's own servers.
  // .chat() explicitly, NOT the default callable form — createOpenAI()('model')
  // defaults to the newer Responses API (/v1/responses), which our fake
  // server does not implement. .chat() targets /v1/chat/completions,
  // the shape most third-party OpenAI-compatible backends actually speak.
  fake: () => createOpenAI({
    apiKey: 'fake-key-not-checked',
    baseURL: process.env.FAKE_PROVIDER_URL || 'http://localhost:4000/v1',
  }).chat('fake-model-v1'),
  // Third provider, added live to test the "under 15 minutes" claim.
  // Same .chat() pattern, different baseURL — this is the entire diff.
  ollama: () => createOpenAI({
    apiKey: 'ollama-does-not-check-keys',
    baseURL: process.env.OLLAMA_URL || 'http://localhost:11434/v1',
  }).chat('llama3.1'),
};

export function resolveModel() {
  const name = process.env.MODEL_PROVIDER;
  if (!name) {
    throw new Error('MODEL_PROVIDER env var is not set. Valid values: ' + Object.keys(factories).join(', '));
  }
  const factory = factories[name];
  if (!factory) {
    throw new Error(`Unknown provider "${name}". Valid values: ${Object.keys(factories).join(', ')}`);
  }
  return factory();
}