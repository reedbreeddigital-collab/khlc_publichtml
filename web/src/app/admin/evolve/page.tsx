"use client";

import React from "react";
import Link from "next/link";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminEvolveEntriesPage() {
  const { liveEvolveRegs } = useAdmin();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#0d002b]">
            Evolve 8.0 Registered Schools &amp; Teams ({liveEvolveRegs.length})
          </h2>
          <p className="text-xs text-gray-500">
            Live <code>/evolve</code> school registrations persisted in Neon
            Postgres. Import test pupils into the Student Roster with one click.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/students"
            className="rounded-xl bg-[#100038] px-4 py-2.5 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white"
          >
            Generate Exam Slips →
          </Link>
          <Link
            href="/evolve#register"
            className="rounded-xl bg-[#3b00b3] px-4 py-2.5 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
          >
            Open Registration Form ↗
          </Link>
        </div>
      </div>

      {liveEvolveRegs.length > 0 ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase text-gray-400">
                <th className="py-3 px-3">Ref</th>
                <th className="py-3 px-3">School</th>
                <th className="py-3 px-3">Track</th>
                <th className="py-3 px-3">Path &amp; Theme</th>
                <th className="py-3 px-3">Coordinator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {liveEvolveRegs.map((reg) => (
                <tr key={reg.id}>
                  <td className="py-3 px-3 font-extrabold text-[#3b00b3]">
                    {reg.referenceId}
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-bold">{reg.schoolName}</p>
                    <p className="text-xs text-gray-500">
                      {reg.schoolLocation}
                    </p>
                  </td>
                  <td className="py-3 px-3 uppercase text-xs font-bold">
                    {reg.track}
                  </td>
                  <td className="py-3 px-3 text-xs text-gray-600">
                    {reg.projectPath || "Online Test"}{" "}
                    {reg.projectTheme ? `· ${reg.projectTheme}` : ""}
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <p className="font-bold">{reg.coordinatorName}</p>
                    <p className="text-gray-500">{reg.phone}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-[#faf9ff] p-6 text-center">
          <p className="text-sm font-extrabold text-[#0d002b]">
            No live school registrations submitted yet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Schools registering on <code>/evolve#register</code> will stream
            here automatically.
          </p>
        </div>
      )}
    </div>
  );
}
