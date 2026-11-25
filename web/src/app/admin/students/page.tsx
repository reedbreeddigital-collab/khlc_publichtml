"use client";

import React from "react";
import QuizStudentsModule from "@/components/admin/QuizStudentsModule";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminStudentsPage() {
  const {
    students,
    attempts,
    handleCreateStudent,
    handleDeleteStudent,
    handleImportRegistrations,
    handleResetAttempt,
  } = useAdmin();

  return (
    <QuizStudentsModule
      students={students}
      attempts={attempts}
      onCreateStudent={handleCreateStudent}
      onDeleteStudent={handleDeleteStudent}
      onImportRegistrations={handleImportRegistrations}
      onResetAttempt={handleResetAttempt}
    />
  );
}
