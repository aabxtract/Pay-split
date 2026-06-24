"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@/components/wallet-provider";
import Link from "next/link";

interface Recipient {
  id: number;
  address: string;
  amount: string;
}

let nextId = 1;

export default function DispensePage() {
  const { connected, connectWallet, sendTransfer } = useWallet();
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: nextId++, address: "", amount: "" },
  ]);
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<
    { address: string; amount: string; txId?: string; error?: string }[]
  >([]);

  const addRecipient = () => {
    setRecipients((prev) => [
      ...prev,
      { id: nextId++, address: "", amount: "" },
    ]);
  };

  const removeRecipient = (id: number) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRecipient = (
    id: number,
    field: "address" | "amount",
    value: string
  ) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const parseCSV = useCallback((text: string) => {
    const lines = text.trim().split("\n");
    const parsed: Recipient[] = [];
    for (const line of lines) {
      const parts = line.split(/[,\t]/).map((s) => s.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        parsed.push({ id: nextId++, address: parts[0], amount: parts[1] });
      }
    }
    if (parsed.length > 0) setRecipients(parsed);
  }, []);

  const totalSTX = recipients.reduce((sum, r) => {
    const val = parseFloat(r.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const isValid = recipients.every(
    (r) =>
      r.address.startsWith("S") &&
      r.address.length >= 34 &&
      !isNaN(parseFloat(r.amount)) &&
      parseFloat(r.amount) > 0
  );

  const handleDisperse = async () => {
    if (!isValid || sending) return;
    setSending(true);
    setResults([]);

    const txResults: {
      address: string;
      amount: string;
      txId?: string;
      error?: string;
    }[] = [];

    for (const r of recipients) {
      try {
        const amountMicro = String(
          BigInt(Math.round(parseFloat(r.amount) * 1_000_000))
        );
        const response = await sendTransfer(r.address, amountMicro, memo || undefined);
        txResults.push({
          address: r.address,
          amount: r.amount,
          txId: response.txid,
        });
      } catch (err) {
        txResults.push({
          address: r.address,
          amount: r.amount,
          error: err instanceof Error ? err.message : "Transaction failed",
        });
      }
      setResults([...txResults]);
    }

    setSending(false);
  };

  if (!connected) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-32 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-card text-2xl">
          🔒
        </div>
        <h1 className="mb-2 text-2xl font-bold">Connect Your Wallet</h1>
        <p className="mb-8 text-muted">
          You need to connect a Stacks wallet to start dispensing tokens.
        </p>
        <button
          onClick={connectWallet}
          className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(85,70,255,0.4)]"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold">Disperse STX</h1>
      <p className="mb-10 text-muted">
        Add recipients and amounts below, or paste a CSV to bulk-import.
      </p>

      {/* CSV Import */}
      <div className="mb-8">
        <label className="mb-2 block text-sm font-medium text-muted">
          Bulk Import (CSV: address,amount)
        </label>
        <textarea
          placeholder={"SP2MF04...address,10.5\nST2EB9W...address,2.3"}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
          onChange={(e) => parseCSV(e.target.value)}
        />
      </div>

      {/* Recipients */}
      <div className="mb-6 space-y-3">
        {recipients.map((r, i) => (
          <div key={r.id} className="flex items-center gap-3">
            <span className="w-6 text-right text-xs text-muted">{i + 1}</span>
            <input
              type="text"
              placeholder="STX Address (S...)"
              value={r.address}
              onChange={(e) => updateRecipient(r.id, "address", e.target.value)}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
            <input
              type="number"
              placeholder="STX"
              step="0.000001"
              min="0"
              value={r.amount}
              onChange={(e) => updateRecipient(r.id, "amount", e.target.value)}
              className="w-32 rounded-xl border border-border bg-card px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
            {recipients.length > 1 && (
              <button
                onClick={() => removeRecipient(r.id)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-error hover:text-error"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addRecipient}
        className="mb-6 flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
      >
        <span className="text-lg">+</span> Add Recipient
      </button>

      {/* Memo */}
      <div className="mb-8">
        <label className="mb-2 block text-sm font-medium text-muted">
          Memo (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Community rewards May 2026"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={34}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Summary */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Recipients</span>
          <span className="font-mono">{recipients.length}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-muted">Total</span>
          <span className="font-mono text-lg font-semibold text-foreground">
            {totalSTX.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 6,
            })}{" "}
            STX
          </span>
        </div>
      </div>

      {/* Disperse Button */}
      <button
        onClick={handleDisperse}
        disabled={!isValid || sending}
        className="w-full rounded-full bg-primary py-4 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(85,70,255,0.4)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {sending
          ? "Sending..."
          : `Disperse ${totalSTX.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} STX`}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Results</h2>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      r.txId
                        ? "text-success"
                        : r.error
                          ? "text-error"
                          : "text-warning"
                    }
                  >
                    {r.txId ? "✓" : r.error ? "✗" : "⏳"}
                  </span>
                  <span className="font-mono text-muted">
                    {r.address.slice(0, 10)}...{r.address.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{r.amount} STX</span>
                  {r.txId && (
                    <Link
                      href={`https://explorer.stacks.co/txid/${r.txId}`}
                      target="_blank"
                      className="text-accent hover:underline"
                    >
                      View
                    </Link>
                  )}
                  {r.error && (
                    <span className="text-xs text-error">{r.error}</span>
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
