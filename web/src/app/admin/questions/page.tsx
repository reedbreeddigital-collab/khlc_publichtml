"use client";

import React from "react";
import QuestionBankModule from "@/components/admin/QuestionBankModule";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminQuestionsPage() {
  const {
    questions,
    quizzes,
    handleCreateQuestion,
    handleUpdateQuestion,
    handleDeleteQuestion,
    handleImportCsv,
  } = useAdmin();

  return (
    <QuestionBankModule
      questions={questions}
      quizzes={quizzes}
      onCreateQuestion={handleCreateQuestion}
      onUpdateQuestion={handleUpdateQuestion}
      onDeleteQuestion={handleDeleteQuestion}
      onImportCsv={handleImportCsv}
    />
  );
}
