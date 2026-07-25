import 'server-only';

// ==========================================================================
// Adapter registration — importing this (server-only) file registers every
// provider adapter into the registry. Gemini is real; OpenAI/Claude/DeepSeek are
// prepared stubs. This is the ONLY module wired to concrete implementations.
// ==========================================================================

import { registerProvider } from '../registry';
import { geminiProvider } from './gemini';
import { openaiProvider, claudeProvider, deepseekProvider } from './stubs';

registerProvider(geminiProvider);
registerProvider(openaiProvider);
registerProvider(claudeProvider);
registerProvider(deepseekProvider);

export { geminiProvider, openaiProvider, claudeProvider, deepseekProvider };
