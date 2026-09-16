// app/admin/page.tsx
"use client";

import { PageHeader } from "../components/admin/PageHeader";
import { StatCard } from "../components/admin/StatCard";
import { StatusBadge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardHeader } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { Skeleton } from "../components/ui/Skeleton";
import {
  useBrands,
  useContactRequests,
  useGallery,
} from "../lib/hooks/useCollectionData";
import { formatDate, truncate } from "../lib/utils";
import { ArrowRight, Images, Mail, Palette, Plus, Shirt } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function AdminDashboardPage() {
  const brands = useBrands();
  const gallery = useGallery();
  const requests = useContactRequests();

  const totalColors = useMemo(
    () => brands.data.reduce((sum, brand) => sum + (brand.colorCount || 0), 0),
    [brands.data],
  );

  const newRequests = useMemo(
    () => requests.data.filter((request) => request.status === "new").length,
    [requests.data],
  );

  const recentRequests = requests.data.slice(0, 5);
  const recentBrands = brands.data.slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of SS Executive catalogue and inbound enquiries."
        actions={
          <Link href="/admin/brands/new">
            <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
              New brand
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Brands"
          value={brands.data.length}
          loading={brands.loading}
          icon={<Shirt className="h-4 w-4" />}
          accent="red"
        />
        <StatCard
          label="Total Colours"
          value={totalColors}
          loading={brands.loading}
          icon={<Palette className="h-4 w-4" />}
          accent="blue"
        />
        <StatCard
          label="Gallery Images"
          value={gallery.data.length}
          loading={gallery.loading}
          icon={<Images className="h-4 w-4" />}
        />
        <StatCard
          label="New Requests"
          value={newRequests}
          hint={`${requests.data.length} total`}
          loading={requests.loading}
          icon={<Mail className="h-4 w-4" />}
          accent="blue"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent contact requests"
            action={
              <Link
                href="/admin/contact-requests"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {requests.loading ? (
            <div className="space-y-4 px-5 py-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-3 w-56 max-w-full" />
                </div>
              ))}
            </div>
          ) : requests.error ? (
            <ErrorState message={requests.error} />
          ) : recentRequests.length === 0 ? (
            <EmptyState
              icon={<Mail className="h-5 w-5" />}
              title="No contact requests"
              description="Enquiries submitted from the website will appear here."
            />
          ) : (
            <ul className="divide-y divide-[#E5E5E5]">
              {recentRequests.map((request) => (
                <li key={request.id}>
                  <Link
                    href={`/admin/contact-requests/${request.id}`}
                    className="flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-[#F6F6F6]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-medium text-black">
                          {request.name}
                        </p>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-black/50">
                        {truncate(request.message, 72)}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-black/40">
                      {formatDate(request.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recently added brands"
            action={
              <Link
                href="/admin/brands"
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[#1845D6] hover:opacity-75"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {brands.loading ? (
            <div className="space-y-4 px-5 py-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-8 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-44" />
                  </div>
                </div>
              ))}
            </div>
          ) : brands.error ? (
            <ErrorState message={brands.error} />
          ) : recentBrands.length === 0 ? (
            <EmptyState
              icon={<Shirt className="h-5 w-5" />}
              title="No brands yet"
              description="Create your first brand to start building the catalogue."
              action={
                <Link href="/admin/brands/new">
                  <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />}>
                    New brand
                  </Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-[#E5E5E5]">
              {recentBrands.map((brand) => (
                <li key={brand.id}>
                  <Link
                    href={`/admin/brands/${brand.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F6F6F6]"
                  >
                    <span className="h-12 w-10 shrink-0 overflow-hidden rounded border border-[#E5E5E5] bg-[#F6F6F6]">
                      {brand.image ? (
                        // eslint-disable-next-line ..next/next/no-img-element
                        <img
                          src={brand.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-black">
                        {brand.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-black/50">
                        {brand.colorCount} colour
                        {brand.colorCount === 1 ? "" : "s"} ·{" "}
                        {formatDate(brand.createdAt)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-black/25" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
