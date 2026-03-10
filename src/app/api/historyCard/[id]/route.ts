import { NextResponse } from "next/server";
import { getArticleWithQuizzes } from "@/lib/file-db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // 🔥 params-г заавал await хийнэ
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const article = await getArticleWithQuizzes(id);

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}
