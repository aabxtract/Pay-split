"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadHistory,
  clearHistory,
  refreshPendingStatuses,
  type DispenseRecord,
  type TxStatus,
} from "@/lib/history";

function StatusBadge({ status }: { status: TxStatus }) {
  const styles: Record<TxStatus, string> = {
    confirmed: "bg-success/15 text-success",
    failed: "bg-error/15 text-error",
    pending: "bg-warning/15 text-warning",
  };
  const labels: Record<TxStatus, string> = {
    confirmed: "Confirmed",
    failed: "Failed",
    pending: "Pending",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === "confirmed" ? "bg-success" : status === "failed" ? "bg-error" : "bg-warning animate-pulse"}`} />
      {labels[status]}
    </span>
  );
}

function RecordRow({ record }: { record: DispenseRecord }) {
  const [expanded, setExpanded] = useState(false);
  const confirmedCount = record.recipients.filter((r) => r.status === "confirmed").length;
  const failedCount = record.recipients.filter((r) => r.status === "failed").length;
  const pendingCount = record.recipients.filter((r) => r.status === "pending").length;

  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium text-foreground">
            {new Date(record.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="text-sm text-muted">
            {record.recipients.length} recipient{record.recipients.length !== 1 ? "s" : ""}
          </span>
          <span className="font-mono text-sm text-foreground">
            {record.totalStx.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })} STX
          </span>
        </div>
        <div className="flex items-center gap-2">
          {confirmedCount > 0 && (
            <span className="text-xs text-success">{confirmedCount}✓</span>
          )}
          {failedCount > 0 && (
            <span className="text-xs text-error">{failedCount}✗</span>
          )}
          {pendingCount > 0 && (
            <span className="text-xs text-warning">{pendingCount}⏳</span>
          )}
          <svg
            className={`h-4 w-4 text-muted transition-transform ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3">
          {record.memo && (
            <p className="mb-3 text-xs text-muted">Memo: {record.memo}</p>
          )}
          <div className="space-y-2">
            {record.recipients.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-background px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <span className="font-mono text-muted">
                    {r.address.slice(0, 10)}...{r.address.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{r.amountStx} STX</span>
                  {r.txid && (
                    <Link
                      href={`https://explorer.stacks.co/txid/${r.txid}`}
                      target="_blank"
                      className="text-xs text-accent hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TransactionHistory() {
  const [records, setRecords] = useState<DispenseRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setRecords(loadHistory());
  }, []);

  useEffect(() => {
    const pendingExists = records.some((r) =>
      r.recipients.some((rx) => rx.status === "pending")
    );
    if (!pendingExists) return;

    const interval = setInterval(async () => {
      setRefreshing(true);
      await refreshPendingStatuses();
      setRecords(loadHistory());
      setRefreshing(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [records]);

  const handleClear = () => {
    clearHistory();
    setRecords([]);
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-xl">
          📋
        </div>
        <h3 className="mb-1 text-lg font-semibold">No History Yet</h3>
        <p className="text-sm text-muted">
          Your completed dispenses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Dispense History
          {refreshing && (
            <span className="ml-2 text-xs text-muted">Updating...</span>
          )}
        </h2>
        <button
          onClick={handleClear}
          className="text-xs text-muted transition-colors hover:text-error"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-3">
        {records.map((record) => (
          <RecordRow key={record.id} record={record} />
        ))}
      </div>
    </div>
  );
}
