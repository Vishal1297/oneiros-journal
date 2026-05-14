import { describe, it, expect, beforeEach, vi } from 'vitest';
import { geminiService } from './geminiService';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

// @ts-expect-error Mock global window for tests
global.window = {
  localStorage: localStorageMock
};

// Mock the generateContent method to return a dummy response
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            emotionalTheme: "Test Theme",
            surrealPrompt: "Test Prompt",
            interpretation: "Test Interpretation",
            symbols: ["Symbol1"]
          }),
          candidates: [{
            content: {
              parts: [{
                inlineData: { data: "test-image-data" }
              }]
            }
          }]
        })
      };
      chats = {
        create: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockResolvedValue({
            text: "Test Chat Response"
          })
        })
      };
    },
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      ARRAY: 'ARRAY'
    }
  };
});

describe('geminiService', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should enforce rate limits correctly', async () => {
    const transcript = "I had a dream about a floating city.";
    
    // We should be able to call it 30 times
    for (let i = 0; i < 30; i++) {
      await expect(geminiService.analyzeDream(transcript)).resolves.toBeDefined();
    }

    // The 31st time should throw
    await expect(geminiService.analyzeDream(transcript)).rejects.toThrow(/Rate limit exceeded/);
  });
  
  it('should successfully parse dream analysis', async () => {
    const transcript = "A simple dream.";
    const result = await geminiService.analyzeDream(transcript);
    
    expect(result.emotionalTheme).toBe("Test Theme");
    expect(result.surrealPrompt).toBe("Test Prompt");
    expect(result.symbols).toContain("Symbol1");
  });
});
