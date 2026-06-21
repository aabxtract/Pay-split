import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-bold text-white">
            SX
          </div>
          <span className="text-sm text-muted">
            &copy; {new Date().getFullYear()} STX Dispense
          </span>
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link
            href="https://www.stacks.co"
            target="_blank"
            className="hover:text-foreground"
          >
            Stacks
          </Link>
          <Link
            href="https://docs.stacks.co"
            target="_blank"
            className="hover:text-foreground"
          >
            Docs
          </Link>
          <Link
            href="https://explorer.stacks.co"
            target="_blank"
            className="hover:text-foreground"
          >
            Explorer
          </Link>
        </div>
      </div>
    </footer>
  );
}
