// app/api/history/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/clerk-server";
import { listArticlesByUserId, upsertUserByClerkId } from "@/lib/file-db";

export const runtime = "nodejs";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await upsertUserByClerkId({
    clerkId,
    email: "dev@example.com",
  });

  if (!user) {
    return NextResponse.json([]);
  }

  const articles = await listArticlesByUserId(user.id);

  return NextResponse.json(
    articles.map((a) => ({
      id: a.id,
      title: a.title,
      createdAt: a.createdAt,
    }))
  );
}
