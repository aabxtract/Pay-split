const STORAGE_KEY = "stx_dispense_history";
const MAX_RECORDS = 50;

export type TxStatus = "pending" | "confirmed" | "failed";

export interface DispenseRecipient {
  address: string;
  amountStx: number;
  txid: string | null;
  status: TxStatus;
}

export interface DispenseRecord {
  id: string;
  sender: string;
  network: "mainnet" | "testnet";
  memo: string | null;
  recipients: DispenseRecipient[];
  totalStx: number;
  totalFeeMicroStx: number;
  createdAt: string;
}

function generateId(): string {
  return `disp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadHistory(): DispenseRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: DispenseRecord[]): void {
  if (typeof window === "undefined") return;
  const trimmed = records.slice(0, MAX_RECORDS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function addRecord(record: Omit<DispenseRecord, "id" | "createdAt">): DispenseRecord {
  const history = loadHistory();
  const newRecord: DispenseRecord = {
    ...record,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  history.unshift(newRecord);
  saveHistory(history);
  return newRecord;
}

export function updateRecord(id: string, updates: Partial<DispenseRecord>): void {
  const history = loadHistory();
  const idx = history.findIndex((r) => r.id === id);
  if (idx === -1) return;
  history[idx] = { ...history[idx], ...updates };
  saveHistory(history);
}

export function updateRecipientStatus(
  recordId: string,
  txid: string,
  status: TxStatus
): void {
  const history = loadHistory();
  const record = history.find((r) => r.id === recordId);
  if (!record) return;
  const recipient = record.recipients.find((r) => r.txid === txid);
  if (!recipient) return;
  recipient.status = status;
  saveHistory(history);
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const HIRO_API = "https://api.hiro.so";

export async function fetchTxStatus(txid: string): Promise<TxStatus> {
  try {
    const res = await fetch(`${HIRO_API}/extended/v1/tx/${txid}`);
    if (!res.ok) return "pending";
    const data = await res.json();
    if (data.tx_status === "success") return "confirmed";
    if (
      data.tx_status === "abort_by_response" ||
      data.tx_status === "abort_by_post_condition"
    ) {
      return "failed";
    }
    return "pending";
  } catch {
    return "pending";
  }
}

export async function refreshPendingStatuses(): Promise<void> {
  const history = loadHistory();
  let changed = false;

  for (const record of history) {
    for (const recipient of record.recipients) {
      if (recipient.status === "pending" && recipient.txid) {
        const newStatus = await fetchTxStatus(recipient.txid);
        if (newStatus !== "pending") {
          recipient.status = newStatus;
          changed = true;
        }
      }
    }
  }

  if (changed) saveHistory(history);
}
