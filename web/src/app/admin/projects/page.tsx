"use client";

import React from "react";
import ProjectSubmissionsModule from "@/components/admin/ProjectSubmissionsModule";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminProjectsPage() {
  const { projects, handleReviewProject } = useAdmin();

  return (
    <ProjectSubmissionsModule
      submissions={projects}
      onReviewProject={handleReviewProject}
    />
  );
}
