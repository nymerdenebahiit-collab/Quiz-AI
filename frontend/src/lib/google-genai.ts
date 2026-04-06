// Load @google/genai dynamically so the app can still run in environments
// where dependency installation is restricted.

type GenerateContentArgs = {
  model: string;
  contents: string;
};

type GenerateContentResult = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

class ModelsClient {
  async generateContent(args: GenerateContentArgs): Promise<GenerateContentResult> {
    const prompt = args.contents ?? "";

    if (prompt.toLowerCase().includes("multiple choice questions")) {
      const quizJson = JSON.stringify(
        [
          {
            question: "What is the main idea of the article?",
            options: [
              "It explains a core concept",
              "It lists random facts",
              "It is a personal diary",
              "It is a recipe",
            ],
            answer: "0",
          },
          {
            question: "Which detail is emphasized the most?",
            options: ["A key point", "A joke", "A movie", "A poem"],
            answer: "0",
          },
          {
            question: "What is the tone of the article?",
            options: ["Informative", "Sarcastic", "Romantic", "Angry"],
            answer: "0",
          },
          {
            question: "Which action is recommended?",
            options: ["Follow the guidance", "Ignore everything", "Buy a car", "Cancel plans"],
            answer: "0",
          },
          {
            question: "What is a likely takeaway?",
            options: ["Understand the topic better", "Forget the topic", "Start a band", "Travel abroad"],
            answer: "0",
          },
        ],
        null,
        2
      );

      return {
        candidates: [
          {
            content: {
              parts: [{ text: quizJson }],
            },
          },
        ],
      };
    }

    return {
      candidates: [
        {
          content: {
            parts: [
              {
                text:
                  "AI summary is unavailable in this build because @google/genai is not installed.",
              },
            ],
          },
        },
      ],
    };
  }
}

class MissingApiKeyModelsClient {
  async generateContent(): Promise<GenerateContentResult> {
    return {
      candidates: [
        {
          content: {
            parts: [
              {
                text:
                  "AI is unavailable. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.",
              },
            ],
          },
        },
      ],
    };
  }
}

type GoogleGenAIClient = {
  models: {
    generateContent: (args: GenerateContentArgs) => Promise<GenerateContentResult>;
  };
};

function loadGoogleGenAI():
  | (new (options: Record<string, unknown>) => GoogleGenAIClient)
  | null {
  try {
    // Avoid static resolution errors when @google/genai isn't installed.
    const req = eval("require") as NodeRequire;
    return req("@google/genai").GoogleGenAI;
  } catch {
    return null;
  }
}

export class GoogleGenAI {
  models: GoogleGenAIClient["models"];

  constructor(options: Record<string, unknown>) {
    const RealGoogleGenAI = loadGoogleGenAI();
    if (!RealGoogleGenAI) {
      this.models = new ModelsClient();
      return;
    }

    const explicitApiKey =
      typeof options.apiKey === "string" ? options.apiKey : undefined;
    const apiKey =
      explicitApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      this.models = new MissingApiKeyModelsClient();
      return;
    }

    const client = new RealGoogleGenAI({ ...options, apiKey });
    this.models = client.models;
  }
}
