import { NextResponse } from "next/server";
import { GoogleGenAI } from "@/lib/google-genai";
import {
  getArticleWithQuizzes,
  getQuizzesByArticleId,
  saveQuizzesForArticle,
} from "@/lib/file-db";

export const runtime = "nodejs";

const ai = new GoogleGenAI({});

type MCQ = {
  question: string;
  options: string[];
  answer: string;
};

function buildFallbackQuestions(summary: string): MCQ[] {
  const topic = summary.trim().slice(0, 80) || "the article";
  return [
    {
      question: `What is the primary focus of ${topic}?`,
      options: [
        "Explaining the main idea clearly",
        "Providing unrelated entertainment",
        "Describing a cooking recipe",
        "Listing random names only",
      ],
      answer: "0",
    },
    {
      question: "Which approach best helps understand this summary?",
      options: [
        "Identify key points and examples",
        "Ignore context and skim only titles",
        "Memorize without understanding",
        "Skip all details",
      ],
      answer: "0",
    },
    {
      question: "What should a reader do after reading the summary?",
      options: [
        "Apply or review the core takeaway",
        "Discard all information immediately",
        "Assume the opposite is always true",
        "Focus only on unrelated topics",
      ],
      answer: "0",
    },
    {
      question: "Which statement is most likely true?",
      options: [
        "The summary is intended to be informative",
        "The summary is purely fictional lyrics",
        "The summary is a shopping receipt",
        "The summary is only code syntax",
      ],
      answer: "0",
    },
    {
      question: "What is the best way to validate understanding?",
      options: [
        "Answer questions about the main points",
        "Skip questions and guess randomly",
        "Read only the last word",
        "Avoid checking comprehension",
      ],
      answer: "0",
    },
  ];
}

async function generateQuestionsFromSummary(summary: string): Promise<MCQ[]> {
  const prompt = `
Generate 5 multiple choice questions based on the following article summary.

Return the response in this exact JSON format:
[
  {
    "question": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "0"
  }
]

Rules:
- Return ONLY valid JSON
- answer must be the index (0-3) of the correct option
- Do NOT add explanations or extra text

Article summary:
${summary}
`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text =
      result.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

    const questions: MCQ[] = JSON.parse(text);
    if (Array.isArray(questions) && questions.length > 0) return questions;
  } catch (error) {
    console.error("AI quiz generation failed, using fallback:", error);
  }

  return buildFallbackQuestions(summary);
}

export async function POST(req: Request) {
  try {
    const { articleId, summary } = await req.json();

    // Case 1: Generate quizzes from summary only (for new unsaved articles)
    if (summary && !articleId) {
      const generatedQuizzes = await generateQuestionsFromSummary(summary);

      if (!generatedQuizzes || generatedQuizzes.length === 0) {
        return NextResponse.json(
          { message: "Failed to generate quizzes" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        quizzes: generatedQuizzes,
        isExisting: false,
      });
    }

    // Case 2: Get or generate quizzes for an existing article
    if (!articleId) {
      return NextResponse.json(
        { message: "Article ID or summary is required" },
        { status: 400 }
      );
    }

    const article = await getArticleWithQuizzes(articleId);

    if (!article) {
      return NextResponse.json(
        { message: "Article not found" },
        { status: 404 }
      );
    }

    // If quizzes already exist, return them
    if (article.quizzes && article.quizzes.length > 0) {
      return NextResponse.json({
        success: true,
        quizzes: article.quizzes,
        isExisting: true,
      });
    }

    // Generate new quizzes
    const generatedQuizzes = await generateQuestionsFromSummary(article.summary);

    if (!generatedQuizzes || generatedQuizzes.length === 0) {
      return NextResponse.json(
        { message: "Failed to generate quizzes" },
        { status: 500 }
      );
    }

    // Save quizzes to database
    await saveQuizzesForArticle({
      articleId,
      quizzes: generatedQuizzes,
    });

    // Fetch the created quizzes to return them with IDs
    const quizzes = await getQuizzesByArticleId(articleId);

    return NextResponse.json({
      success: true,
      quizzes,
      isExisting: false,
    });
  } catch (error) {
    console.error("Generate quizzes error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
