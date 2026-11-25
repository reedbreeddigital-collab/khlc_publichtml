"use client";

import React from "react";
import { Mail, Download } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminEnquiriesPage() {
  const {
    liveEnquiries,
    subscribers,
    promoteEnquiryToCrm,
    exportSubscribersCsv,
  } = useAdmin();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4">
          <h2 className="text-lg font-extrabold text-[#0d002b]">
            Website Enquiry Inbox ({liveEnquiries.length})
          </h2>
          <p className="text-xs text-gray-500">
            Incoming submissions from the main website contact pathways can be
            promoted to CRM deals in one click.
          </p>
        </div>

        {liveEnquiries.length > 0 ? (
          <div className="mt-5 space-y-3">
            {liveEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-100 bg-[#faf9ff] p-4"
              >
                <div>
                  <span className="rounded-full bg-[#3b00b3]/10 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#3b00b3]">
                    {enq.pathway}
                  </span>
                  <h3 className="mt-1.5 text-sm font-extrabold text-[#0d002b]">
                    {enq.fullName} · {enq.orgDetail}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {enq.focus} · {enq.phone} · {enq.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => promoteEnquiryToCrm(enq)}
                  className="shrink-0 rounded-xl bg-[#3b00b3] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#9dff13] hover:text-[#0d002b]"
                >
                  Promote to CRM →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-[#faf9ff] p-6 text-center">
            <p className="text-sm font-extrabold text-[#0d002b]">
              No live API enquiries fetched yet
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Website enquiries sent to <code>POST /api/v1/enquiries</code> will
              appear here.
            </p>
          </div>
        )}
      </div>

      {/* Newsletter Subscribers Panel */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#0d002b]">
              <Mail className="h-5 w-5 text-[#3b00b3]" />
              <span>Newsletter Subscribers ({subscribers.length})</span>
            </h2>
            <p className="text-xs text-gray-500">
              Emails collected from the footer signup banner across all public
              pages, stored in Neon Postgres.
            </p>
          </div>
          {subscribers.length > 0 && (
            <button
              type="button"
              onClick={exportSubscribersCsv}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#100038] px-4 py-2 text-xs font-extrabold text-[#9dff13] hover:bg-[#3b00b3] hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {subscribers.length > 0 ? (
          <div className="mt-4 divide-y divide-gray-100">
            {subscribers.map((sub) => (
              <div
                key={sub.email}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <span className="font-bold text-[#0d002b]">{sub.email}</span>
                <span className="text-gray-400">
                  {new Date(sub.subscribedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-center text-xs text-gray-500">
            No newsletter subscribers recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
