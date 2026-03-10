import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createArticleWithQuizzes, upsertUserByClerkId } from "@/lib/file-db";

export const runtime = "nodejs";

// 👇 Quiz type тодорхойлж байна
type QuizInput = {
  question: string;
  options: string[];
  answer: string;
};

export async function POST(req: Request) {
  try {
    // 1️⃣ Clerk auth
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser || !clerkUser.emailAddresses[0]?.emailAddress) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Body parse + type check
    const body: {
      title?: string;
      content: string;
      summary: string;
      quizzes: QuizInput[];
    } = await req.json();

    const { title, content, summary, quizzes } = body;

    if (
      !content ||
      !summary ||
      !Array.isArray(quizzes) ||
      quizzes.length === 0
    ) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // 3️⃣ User upsert (email REQUIRED гэдгийг шийдэж өгч байна)
    const user = await upsertUserByClerkId({
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: clerkUser.firstName ?? undefined,
    });

    // 4️⃣ Article + Quiz create (file DB)
    const { articleId } = await createArticleWithQuizzes({
      userId: user.id,
      title: title ?? "Untitled",
      content,
      summary,
      quizzes,
    });

    // 5️⃣ Success
    return NextResponse.json({
      success: true,
      articleId,
    });
  } catch (error: unknown) {
    console.error("Save & Leave error:", error);

    // error type check
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        message: "Server error",
        error: message,
      },
      { status: 500 },
    );
  }
}
