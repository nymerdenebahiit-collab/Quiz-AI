// Temporary local stub to allow builds when @google/genai is not installed.
// Replace import back to "@google/genai" once the package is installed.

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

export class GoogleGenAI {
  models: ModelsClient;

  constructor(_options: Record<string, unknown>) {
    this.models = new ModelsClient();
  }
}
