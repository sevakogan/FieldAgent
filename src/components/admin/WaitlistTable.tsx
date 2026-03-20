"use client";

import { useState, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface WaitlistEntry {
  readonly id: string;
  readonly full_name: string;
  readonly email: string;
  readonly type: string;
  readonly referral_code: string;
  readonly referred_by: string | null;
  readonly referral_count: number;
  readonly position: number;
  readonly status: string;
  readonly created_at: string;
}

type SortKey =
  | "position"
  | "full_name"
  | "email"
  | "type"
  | "referral_count"
  | "created_at"
  | "status";

type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

const TYPE_OPTIONS = ["all", "company", "client", "reseller", "pro"] as const;
const STATUS_OPTIONS = ["all", "waiting", "invited", "joined"] as const;

interface WaitlistTableProps {
  readonly initialData: readonly WaitlistEntry[];
}

export default function WaitlistTable({ initialData }: WaitlistTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("position");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [page, setPage] = useState(0);
  const [data, setData] = useState(initialData);

  // ── Filtering ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return data.filter((entry) => {
      if (
        lowerSearch &&
        !entry.full_name.toLowerCase().includes(lowerSearch) &&
        !entry.email.toLowerCase().includes(lowerSearch)
      ) {
        return false;
      }
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      if (statusFilter !== "all" && entry.status !== statusFilter) return false;
      return true;
    });
  }, [data, search, typeFilter, statusFilter]);

  // ── Sorting ────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const dir = sortDir === "asc" ? 1 : -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * dir;
      }
      return String(aVal ?? "").localeCompare(String(bVal ?? "")) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  // ── Pagination ─────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // ── Handlers ───────────────────────────────────────────────────
  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((e) => e.id)));
    }
  }, [paginated, selected.size]);

  // ── Export CSV ──────────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = [
      "Position",
      "Name",
      "Email",
      "Type",
      "Referrals",
      "Referred By",
      "Date",
      "Status",
    ];
    const rows = sorted.map((e) => [
      e.position,
      e.full_name,
      e.email,
      e.type,
      e.referral_count,
      e.referred_by ?? "",
      new Date(e.created_at).toLocaleDateString(),
      e.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  // ── Mark Invited ───────────────────────────────────────────────
  const markInvited = useCallback(async () => {
    if (selected.size === 0) return;

    const supabase = createClient();
    const ids = Array.from(selected);

    const { error } = await supabase
      .from("waitlist")
      .update({ status: "invited" })
      .in("id", ids);

    if (!error) {
      setData((prev) =>
        prev.map((entry) =>
          ids.includes(entry.id) ? { ...entry, status: "invited" } : entry,
        ),
      );
      setSelected(new Set());
    }
  }, [selected]);

  // ── Column header helper ───────────────────────────────────────
  function SortHeader({
    label,
    sortKeyName,
  }: {
    readonly label: string;
    readonly sortKeyName: SortKey;
  }) {
    const active = sortKey === sortKeyName;
    return (
      <th
        className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-[#007AFF]"
        onClick={() => handleSort(sortKeyName)}
      >
        {label}
        {active && (
          <span className="ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>
        )}
      </th>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
        />

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#007AFF]"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "all" ? "All Types" : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#007AFF]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "all" ? "All Statuses" : opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-[#1C1C1E] transition hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            onClick={markInvited}
            disabled={selected.size === 0}
            className="rounded-lg bg-[#007AFF] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0066DD] disabled:opacity-40"
          >
            Mark Invited ({selected.size})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    paginated.length > 0 && selected.size === paginated.length
                  }
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <SortHeader label="Pos" sortKeyName="position" />
              <SortHeader label="Name" sortKeyName="full_name" />
              <SortHeader label="Email" sortKeyName="email" />
              <SortHeader label="Type" sortKeyName="type" />
              <SortHeader label="Referrals" sortKeyName="referral_count" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Referred By
              </th>
              <SortHeader label="Date" sortKeyName="created_at" />
              <SortHeader label="Status" sortKeyName="status" />
            </tr>
          </thead>
          <tbody>
            {paginated.map((entry, idx) => (
              <tr
                key={entry.id}
                className={`border-b border-gray-50 transition hover:bg-gray-50 ${
                  idx % 2 === 1 ? "bg-gray-50/50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(entry.id)}
                    onChange={() => toggleSelect(entry.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-[#1C1C1E]">
                  #{entry.position}
                </td>
                <td className="px-4 py-3 text-[#1C1C1E]">{entry.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{entry.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-700">
                    {entry.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center font-medium text-[#1C1C1E]">
                  {entry.referral_count}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {entry.referred_by ?? "-"}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                      entry.status === "invited"
                        ? "bg-green-100 text-green-700"
                        : entry.status === "joined"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-12 text-center text-gray-400"
                >
                  No entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <p className="text-sm text-gray-500">
          {sorted.length} total &middot; Page {page + 1} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
