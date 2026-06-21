"use client";

import Link from "next/link";
import { useWallet } from "@/components/wallet-provider";

const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Connect your Leather, Xverse, or WalletConnect-compatible wallet.",
  },
  {
    number: "02",
    title: "Add Recipients",
    description: "Enter STX addresses and amounts manually or paste from a CSV.",
  },
  {
    number: "03",
    title: "Disperse",
    description: "Review and broadcast. All transfers execute from your wallet.",
  },
];

const features = [
  {
    title: "Batch Transfers",
    description: "Send STX to dozens of wallets in a single session instead of one-by-one.",
    icon: "⚡",
  },
  {
    title: "CSV Import",
    description: "Paste a CSV of addresses and amounts to onboard recipients fast.",
    icon: "📋",
  },
  {
    title: "Multi-Wallet",
    description: "Works with Leather, Xverse, and any WalletConnect-compatible wallet.",
    icon: "🔗",
  },
  {
    title: "Transparent",
    description: "Every transfer is on-chain. View each tx on the Stacks Explorer.",
    icon: "🔍",
  },
];

export default function HomePage() {
  const { connected } = useWallet();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(85,70,255,0.15)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-32 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            Built on Stacks
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Distribute STX to
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              multiple wallets
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
            Send STX tokens to any number of recipients in one session.
            No smart contracts required — just connect and disperse.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href={connected ? "/dispense" : "#"}
              onClick={!connected ? (e) => { e.preventDefault(); } : undefined}
              className="rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(85,70,255,0.4)]"
            >
              {connected ? "Start Dispensing" : "Connect Wallet to Start"}
            </Link>
            <a
              href="https://docs.stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-8 py-3 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold">How It Works</h2>
          <p className="mx-auto mb-16 max-w-md text-center text-muted">
            Three steps to distribute STX tokens at scale.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-[0_0_30px_rgba(85,70,255,0.1)]"
              >
                <span className="mb-4 inline-block font-mono text-sm text-primary">
                  {step.number}
                </span>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold">Features</h2>
          <p className="mx-auto mb-16 max-w-md text-center text-muted">
            Everything you need for fast, transparent token distribution.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50"
              >
                <span className="mb-3 inline-block text-2xl">{feature.icon}</span>
                <h3 className="mb-1 font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Disperse?</h2>
          <p className="mx-auto mb-10 max-w-md text-muted">
            Connect your wallet and start distributing STX in seconds.
          </p>
          <Link
            href={connected ? "/dispense" : "#"}
            onClick={!connected ? (e) => { e.preventDefault(); } : undefined}
            className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-medium text-white transition-all hover:bg-primary-hover hover:shadow-[0_0_30px_rgba(85,70,255,0.4)]"
          >
            {connected ? "Go to Dispense" : "Connect Wallet"}
          </Link>
        </div>
      </section>
    </div>
  );
}
