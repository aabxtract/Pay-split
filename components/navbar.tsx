"use client";

import Link from "next/link";
import { ConnectWallet } from "./connect-wallet";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            SX
          </div>
          <span className="text-lg font-semibold text-foreground">
            STX Dispense
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dispense"
            className="hidden text-sm text-muted transition-colors hover:text-foreground sm:block"
          >
            Dispense
          </Link>
          <ConnectWallet />
        </div>
      </div>
    </nav>
  );
}
