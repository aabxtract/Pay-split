const STORAGE_KEY = "stx_dispense_address_book";
const MAX_GROUPS = 20;

export interface AddressBookContact {
  address: string;
  label?: string;
}

export interface AddressBookGroup {
  id: string;
  label: string;
  addresses: AddressBookContact[];
  createdAt: string;
  updatedAt: string;
}

export function loadAddressBook(): AddressBookGroup[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAddressBook(groups: AddressBookGroup[]): void {
  if (typeof window === "undefined") return;
  const trimmed = groups.slice(0, MAX_GROUPS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function addGroup(
  label: string,
  addresses: AddressBookContact[]
): AddressBookGroup {
  const book = loadAddressBook();
  const now = new Date().toISOString();
  const group: AddressBookGroup = {
    id: `grp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    label,
    addresses,
    createdAt: now,
    updatedAt: now,
  };
  book.unshift(group);
  saveAddressBook(book);
  return group;
}

export function updateGroup(
  id: string,
  updates: Partial<Pick<AddressBookGroup, "label" | "addresses">>
): void {
  const book = loadAddressBook();
  const idx = book.findIndex((g) => g.id === id);
  if (idx === -1) return;
  book[idx] = {
    ...book[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveAddressBook(book);
}

export function deleteGroup(id: string): void {
  const book = loadAddressBook().filter((g) => g.id !== id);
  saveAddressBook(book);
}
