"use client";

import { useWallet } from "./wallet-provider";

export function ConnectWallet() {
  const { connected, stxAddress, connecting, connectWallet, disconnectWallet } =
    useWallet();

  if (connected && stxAddress) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          <span className="font-mono text-foreground">
            {stxAddress.slice(0, 6)}...{stxAddress.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted transition-colors hover:border-error hover:text-error"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="relative rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(85,70,255,0.4)] disabled:opacity-50"
    >
      {connecting ? (
        <span className="flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Connecting...
        </span>
      ) : (
        "Connect Wallet"
      )}
    </button>
  );
}
