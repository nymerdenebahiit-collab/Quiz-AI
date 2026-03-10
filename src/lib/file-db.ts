import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

type User = {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
};

type Article = {
  id: string;
  userId: string;
  title: string;
  content: string;
  summary: string;
  createdAt: string;
};

type Quiz = {
  id: string;
  articleId: string;
  question: string;
  options: string[];
  answer: string;
};

type Db = {
  users: User[];
  articles: Article[];
  quizzes: Quiz[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const emptyDb: Db = { users: [], articles: [], quizzes: [] };

async function readDb(): Promise<Db> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Db;
  } catch {
    return { ...emptyDb };
  }
}

async function writeDb(db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export async function upsertUserByClerkId(input: {
  clerkId: string;
  email: string;
  name?: string;
}): Promise<User> {
  const db = await readDb();
  const existing = db.users.find((u) => u.clerkId === input.clerkId);

  if (existing) {
    existing.email = input.email;
    existing.name = input.name;
    await writeDb(db);
    return existing;
  }

  const user: User = {
    id: randomUUID(),
    clerkId: input.clerkId,
    email: input.email,
    name: input.name,
  };
  db.users.push(user);
  await writeDb(db);
  return user;
}

export async function createArticleWithQuizzes(input: {
  userId: string;
  title: string;
  content: string;
  summary: string;
  quizzes: Array<{ question: string; options: string[]; answer: string }>;
}): Promise<{ articleId: string }> {
  const db = await readDb();
  const articleId = randomUUID();

  const article: Article = {
    id: articleId,
    userId: input.userId,
    title: input.title,
    content: input.content,
    summary: input.summary,
    createdAt: new Date().toISOString(),
  };
  db.articles.push(article);

  const quizzes: Quiz[] = input.quizzes.map((q) => ({
    id: randomUUID(),
    articleId,
    question: q.question,
    options: q.options,
    answer: q.answer,
  }));
  db.quizzes.push(...quizzes);

  await writeDb(db);
  return { articleId };
}

export async function listArticlesByUserId(userId: string): Promise<Article[]> {
  const db = await readDb();
  return db.articles
    .filter((a) => a.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getArticleWithQuizzes(
  id: string,
): Promise<(Article & { quizzes: Quiz[] }) | null> {
  const db = await readDb();
  const article = db.articles.find((a) => a.id === id);
  if (!article) return null;

  const quizzes = db.quizzes.filter((q) => q.articleId === id);
  return { ...article, quizzes };
}

export async function getQuizzesByArticleId(
  articleId: string,
): Promise<Quiz[]> {
  const db = await readDb();
  return db.quizzes.filter((q) => q.articleId === articleId);
}

export async function saveQuizzesForArticle(input: {
  articleId: string;
  quizzes: Array<{ question: string; options: string[]; answer: string }>;
}): Promise<void> {
  const db = await readDb();
  const quizzes: Quiz[] = input.quizzes.map((q) => ({
    id: randomUUID(),
    articleId: input.articleId,
    question: q.question,
    options: q.options,
    answer: q.answer,
  }));
  db.quizzes.push(...quizzes);
  await writeDb(db);
}
