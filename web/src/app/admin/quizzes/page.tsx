"use client";

import React from "react";
import QuizManagerModule from "@/components/admin/QuizManagerModule";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminQuizzesPage() {
  const { quizzes, handleCreateQuiz, handleUpdateQuiz, handleDeleteQuiz } =
    useAdmin();

  return (
    <QuizManagerModule
      quizzes={quizzes}
      onCreateQuiz={handleCreateQuiz}
      onUpdateQuiz={handleUpdateQuiz}
      onDeleteQuiz={handleDeleteQuiz}
    />
  );
}
