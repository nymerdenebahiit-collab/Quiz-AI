"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateArcticle from "./_components/CreateArcticle";
import SummarizedContent from "./_components/SummarizedContent";
import Quiz from "./_components/Quiz";
import QuizAnswers from "./_components/QuizAnswers";
import { AppSidebar } from "./_features/app-sidebar";
import StarIcon from "@/app/_icons/StarIcon";
import XIcon from "./_icons/XIcon";
import { CardDescription, CardTitle } from "@/components/ui/card";

type Question = {
  question: string;
  options: string[];
  answer: string;
};

type UserAnswer = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export default function Home() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [view, setView] = useState<"create" | "summary" | "quiz" | "answers">(
    "create"
  );

  const handleSaveAndLeave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setSaveError("");

      const res = await fetch("/api/save-and-leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          summary,
          quizzes: questions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.articleId) {
        setSaveError(data?.message ?? "Failed to save article.");
        return;
      }

      router.push(`/article/${data.articleId}`);
    } catch (err) {
      console.error("Save & Leave failed", err);
      setSaveError("Save & Leave failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full w-full grid md:grid-cols-[auto_1fr]">
      <div className="border-r">
        <AppSidebar />
      </div>

      <div className="flex flex-col items-center justify-center">
        {/* CREATE */}
        {view === "create" && (
          <CreateArcticle
            title={title}
            content={content}
            setTitle={setTitle}
            setContent={setContent}
            onGenerated={(s) => {
              setSummary(s);
              setQuizError("");
              setView("summary");
            }}
          />
        )}

        {/* SUMMARY */}
        {view === "summary" && (
          <div className="flex flex-col gap-3">
            {quizError ? <p className="text-sm text-red-600">{quizError}</p> : null}
            <SummarizedContent
              title={title}
              summary={summary}
              content={content}
              onSummaryChange={setSummary}
              onBack={() => setView("create")}
              onQuiz={async () => {
                setQuizError("");

                try {
                  const res = await fetch("/api/quizs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ summary }),
                  });
                  const data = await res.json();

                  if (res.ok && data.success) {
                    setQuestions(data.quizzes);
                    setAnswers([]);
                    setScore(0);
                    setView("quiz");
                    return;
                  }

                  setQuizError(
                    data?.message ??
                      "Quiz үүсгэж чадсангүй. Дараа дахин оролдоно уу."
                  );
                } catch (error) {
                  console.error(error);
                  setQuizError(
                    "Сервертэй холбогдож чадсангүй. `npm run dev` ассан эсэх болон дискний сул зайгаа шалгана уу."
                  );
                }
              }}
            />
          </div>
        )}

        {/* QUIZ */}
        {view === "quiz" && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between">
              <div>
                <div className="flex gap-2 items-center">
                  <StarIcon />
                  <CardTitle>Quick test</CardTitle>
                </div>
                <CardDescription>
                  Take a quick test about your content
                </CardDescription>
              </div>

              <div
                onClick={() => setView("summary")}
                className="w-12 h-10 border rounded-md flex items-center justify-center cursor-pointer"
              >
                <XIcon />
              </div>
            </div>

            <Quiz
              questions={questions}
              onFinish={(result) => {
                setAnswers(result.answers);
                setScore(result.score);
                setView("answers");
              }}
            />
          </div>
        )}

        {/* ANSWERS */}
        {view === "answers" && (
          <div className="flex flex-col gap-6">
            {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
            <div>
              <div className="flex gap-2 items-center">
                <StarIcon />
                <CardTitle>Quick test</CardTitle>
              </div>
              <CardDescription>
                Take a quick test about your content
              </CardDescription>
            </div>
            <QuizAnswers
              score={score}
              total={questions.length}
              answers={answers}
              onRestart={() => setView("quiz")}
              onLeave={handleSaveAndLeave}
              isSaving={isSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
}
