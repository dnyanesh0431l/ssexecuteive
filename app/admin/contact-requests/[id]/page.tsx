// app/admin/contact-requests/[id]/page.tsx
"use client";

import { PageHeader } from "../../../components/admin/PageHeader";
import { StatusSelect } from "../StatusSelect";
import { StatusBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { ErrorState } from "../../../components/ui/ErrorState";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import {
  deleteContactRequest,
  subscribeToContactRequest,
  updateContactStatus,
} from "../../../lib/firebase/contactRequests";
import {
  CONTACT_STATUS_LABEL,
  type ContactRequest,
  type ContactStatus,
} from "../../../lib/types";
import { formatDateTime } from "../../../lib/utils";
import { ArrowLeft, Mail, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ContactRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const requestId = params?.id;
  const router = useRouter();
  const toast = useToast();

  const [request, setRequest] = useState<ContactRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    const unsubscribe = subscribeToContactRequest(
      requestId,
      (data) => {
        setRequest(data);
        setError(data ? null : "This contact request no longer exists.");
        setLoading(false);
      },
      () => {
        setError("Could not load this contact request.");
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [requestId]);

  const changeStatus = async (status: ContactStatus) => {
    if (!request || status === request.status) return;
    setUpdating(true);
    try {
      await updateContactStatus(request.id, status);
      toast.success(
        "Status updated",
        `Marked as ${CONTACT_STATUS_LABEL[status]}.`,
      );
    } catch {
      toast.error("Could not update status", "Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = async () => {
    if (!requestId) return;
    setDeleting(true);
    try {
      await deleteContactRequest(requestId);
      toast.success("Request deleted", "The enquiry has been removed.");
      router.push("/admin/contact-requests");
    } catch {
      toast.error("Could not delete request", "Please try again.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <>
        <Link
          href="/admin/contact-requests"
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to requests
        </Link>
        <div className="rounded-lg border border-[#E5E5E5] bg-white">
          <ErrorState message={error ?? "Request not found."} />
        </div>
      </>
    );
  }

  return (
    <>
      <Link
        href="/admin/contact-requests"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to requests
      </Link>

      <PageHeader
        title={request.name}
        description={`Received ${formatDateTime(request.createdAt)}`}
        actions={
          <Button
            variant="danger"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => setConfirmOpen(true)}
          >
            Delete request
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Message"
              action={<StatusBadge status={request.status} />}
            />
            <CardBody>
              <p className="whitespace-pre-wrap text-[13px] leading-7 text-black/70">
                {request.message || "No message provided."}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Contact details" />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                  Email
                </p>
                <a
                  href={`mailto:${request.email}`}
                  className="mt-1 inline-flex items-center gap-2 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {request.email}
                </a>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-black/40">
                  Phone
                </p>
                {request.phone ? (
                  <a
                    href={`tel:${request.phone}`}
                    className="mt-1 inline-flex items-center gap-2 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {request.phone}
                  </a>
                ) : (
                  <p className="mt-1 text-[13px] text-black/45">Not provided</p>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Status" />
            <CardBody className="space-y-4">
              <StatusSelect
                value={request.status}
                loading={updating}
                onChange={changeStatus}
              />
              <div className="space-y-2 border-t border-[#E5E5E5] pt-4">
                {(["new", "contacted", "closed"] as ContactStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updating || request.status === status}
                      onClick={() => changeStatus(status)}
                      className={
                        "flex w-full items-center justify-between rounded-md border px-3 py-2 text-[13px] transition-colors " +
                        (request.status === status
                          ? "border-[#1845D6] bg-[rgba(24,69,214,0.06)] text-[#1845D6]"
                          : "border-[#E5E5E5] bg-white text-black/60 hover:bg-[#F6F6F6] disabled:opacity-60")
                      }
                    >
                      {CONTACT_STATUS_LABEL[status]}
                      {request.status === status ? (
                        <span className="text-[11px]">Current</span>
                      ) : null}
                    </button>
                  ),
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Metadata" />
            <CardBody className="space-y-3 text-[13px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-black/45">Request ID</span>
                <span className="truncate font-mono text-[11px] text-black/70">
                  {request.id}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-black/45">Received</span>
                <span className="text-black/70">
                  {formatDateTime(request.createdAt)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Delete request from ${request.name}?`}
        description="This enquiry will be permanently removed."
        confirmLabel="Delete request"
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
