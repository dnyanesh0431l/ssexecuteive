// app/admin/contact-requests/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, Mail, Trash2 } from "lucide-react";
import { PageHeader } from "../../components/admin/PageHeader";
import { StatusSelect } from "./StatusSelect";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import {
  deleteContactRequest,
  subscribeToContactRequests,
  updateContactStatus,
} from "../../lib/firebase/contactRequests";
import {
  CONTACT_STATUSES,
  CONTACT_STATUS_LABEL,
  type ContactRequest,
  type ContactStatus,
} from "../../lib/types";
import { cn, formatDate, truncate } from "../../lib/utils";

type Filter = "all" | ContactStatus;

const FILTERS: Filter[] = ["all", ...CONTACT_STATUSES];

export default function ContactRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactRequest | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToContactRequests(
      (data) => {
        setRequests(data);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Could not load contact requests.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const counts = useMemo(() => {
    return {
      all: requests.length,
      new: requests.filter((r) => r.status === "new").length,
      contacted: requests.filter((r) => r.status === "contacted").length,
      closed: requests.filter((r) => r.status === "closed").length,
    } as Record<Filter, number>;
  }, [requests]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesFilter = filter === "all" || request.status === filter;
      const matchesSearch =
        !term ||
        request.name.toLowerCase().includes(term) ||
        request.email.toLowerCase().includes(term) ||
        request.phone.toLowerCase().includes(term) ||
        request.message.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [requests, filter, search]);

  const changeStatus = async (request: ContactRequest, status: ContactStatus) => {
    if (status === request.status) return;
    setUpdatingId(request.id);
    try {
      await updateContactStatus(request.id, status);
      toast.success("Status updated", `${request.name} → ${CONTACT_STATUS_LABEL[status]}`);
    } catch {
      toast.error("Could not update status", "Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteContactRequest(pendingDelete.id);
      toast.success("Request deleted", "The enquiry has been removed.");
      setPendingDelete(null);
    } catch {
      toast.error("Could not delete request", "Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Contact Requests"
        description="Enquiries submitted through the SS Executive website."
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors",
                filter === value
                  ? "border-[#1845D6] bg-[rgba(24,69,214,0.06)] text-[#1845D6]"
                  : "border-[#E5E5E5] bg-white text-black/60 hover:bg-[#F6F6F6]"
              )}
            >
              {value === "all" ? "All" : CONTACT_STATUS_LABEL[value]}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  filter === value ? "bg-white/70 text-[#1845D6]" : "bg-[#F6F6F6] text-black/50"
                )}
              >
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by name, email, phone or message…"
            value={search}
            aria-label="Search contact requests"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <ErrorState message={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-5 w-5" />}
            title={search || filter !== "all" ? "No matching requests" : "No contact requests yet"}
            description={
              search || filter !== "all"
                ? "Try clearing the search or switching filters."
                : "Enquiries submitted from the website will appear here."
            }
            action={
              search || filter !== "all" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#E5E5E5] bg-[#F6F6F6]">
                    {["Name", "Contact", "Message", "Date", "Status", ""].map(
                      (heading, index) => (
                        <th
                          key={heading || index}
                          className={cn(
                            "px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-black/45",
                            index === 5 && "text-right"
                          )}
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filtered.map((request) => (
                    <tr key={request.id} className="transition-colors hover:bg-[#F6F6F6]">
                      <td className="px-5 py-4 align-top">
                        <Link
                          href={`/admin/contact-requests/${request.id}`}
                          className="text-[13px] font-medium text-black hover:text-[#1845D6]"
                        >
                          {request.name}
                        </Link>
                        <div className="mt-1">
                          <StatusBadge status={request.status} />
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top text-[13px] text-black/60">
                        <a
                          href={`mailto:${request.email}`}
                          className="block hover:text-[#1845D6]"
                        >
                          {request.email}
                        </a>
                        {request.phone ? (
                          <a
                            href={`tel:${request.phone}`}
                            className="mt-0.5 block text-black/45 hover:text-[#1845D6]"
                          >
                            {request.phone}
                          </a>
                        ) : null}
                      </td>
                      <td className="max-w-xs px-5 py-4 align-top text-[13px] leading-6 text-black/60">
                        {truncate(request.message, 110)}
                      </td>
                      <td className="px-5 py-4 align-top text-[13px] text-black/60">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <StatusSelect
                          value={request.status}
                          loading={updatingId === request.id}
                          onChange={(status) => changeStatus(request, status)}
                        />
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/contact-requests/${request.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Eye className="h-3.5 w-3.5" />}
                            >
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#B80A0B] hover:bg-[rgba(184,10,11,0.06)] hover:text-[#B80A0B]"
                            icon={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => setPendingDelete(request)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / tablet list */}
            <ul className="divide-y divide-[#E5E5E5] lg:hidden">
              {filtered.map((request) => (
                <li key={request.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/contact-requests/${request.id}`}
                        className="text-[13px] font-medium text-black"
                      >
                        {request.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-black/50">
                        {request.email}
                      </p>
                      {request.phone ? (
                        <p className="mt-0.5 text-xs text-black/45">{request.phone}</p>
                      ) : null}
                    </div>
                    <StatusBadge status={request.status} />
                  </div>

                  <p className="mt-3 text-[13px] leading-6 text-black/60">
                    {truncate(request.message, 140)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-[11px] text-black/40">
                      {formatDate(request.createdAt)}
                    </span>
                    <StatusSelect
                      value={request.status}
                      loading={updatingId === request.id}
                      onChange={(status) => changeStatus(request, status)}
                    />
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/admin/contact-requests/${request.id}`}
                      className="flex-1"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        View details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setPendingDelete(request)}
                      icon={<Trash2 className="h-3.5 w-3.5" />}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete request from ${pendingDelete?.name ?? "contact"}?`}
        description="This enquiry will be permanently removed."
        confirmLabel="Delete request"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}