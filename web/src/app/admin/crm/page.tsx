"use client";

import React from "react";
import CrmModule from "@/components/admin/CrmModule";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminCrmPage() {
  const {
    leads,
    handleAddLead,
    handleUpdateLead,
    handleAddActivity,
    handleDeleteLead,
  } = useAdmin();

  return (
    <CrmModule
      leads={leads}
      onAddLead={handleAddLead}
      onUpdateLead={handleUpdateLead}
      onAddActivity={handleAddActivity}
      onDeleteLead={handleDeleteLead}
    />
  );
}
