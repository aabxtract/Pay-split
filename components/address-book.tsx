"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadAddressBook,
  addGroup,
  deleteGroup,
  type AddressBookGroup,
} from "@/lib/address-book";

interface AddressBookProps {
  onLoad: (addresses: { address: string; amount: string }[]) => void;
  currentRecipients: { address: string; amount: string }[];
}

export function AddressBook({ onLoad, currentRecipients }: AddressBookProps) {
  const [groups, setGroups] = useState<AddressBookGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    setGroups(loadAddressBook());
  }, []);

  const refresh = useCallback(() => {
    setGroups(loadAddressBook());
  }, []);

  const handleSave = () => {
    if (!label.trim() || currentRecipients.length === 0) return;
    const contacts = currentRecipients
      .filter((r) => r.address.trim() !== "")
      .map((r) => ({ address: r.address.trim() }));
    addGroup(label.trim(), contacts);
    setLabel("");
    setSaving(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteGroup(id);
    refresh();
  };

  const handleLoad = (group: AddressBookGroup) => {
    const recipients = group.addresses.map((a) => ({
      address: a.address,
      amount: "",
    }));
    onLoad(recipients);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted transition-colors hover:border-primary hover:text-primary"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        </svg>
        Address Book
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-medium">Saved Groups</span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted hover:text-foreground"
            >
              &times;
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted">
              No saved groups yet.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground truncate">
                      {group.label}
                    </div>
                    <div className="text-xs text-muted">
                      {group.addresses.length} address{group.addresses.length !== 1 ? "es" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLoad(group)}
                      className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDelete(group.id)}
                      className="rounded-lg px-2.5 py-1 text-xs text-muted transition-colors hover:bg-error/10 hover:text-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-border px-4 py-3">
            {saving ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Group label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={!label.trim()}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  onClick={() => setSaving(false)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSaving(true)}
                disabled={currentRecipients.length === 0}
                className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              >
                + Save Current Recipients
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
