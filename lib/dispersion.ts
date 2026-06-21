export type Network = "mainnet" | "testnet" | "devnet";

export type RecipientInput = {
  address?: unknown;
  amountMicroStx?: unknown;
  amountStx?: unknown;
  memo?: unknown;
};

export type DispersionPreviewInput = {
  sender?: unknown;
  network?: unknown;
  memo?: unknown;
  recipient?: unknown;
  amountMicroStx?: unknown;
  amountStx?: unknown;
  recipients?: unknown;
};

export type DispersionRecipient = {
  address: string;
  amountMicroStx: number;
  memo: string | null;
};

export type DispersionPreview = {
  id: string;
  mode: "read-only";
  status: "simulated";
  network: Network;
  sender: string;
  recipientCount: number;
  totalMicroStx: number;
  feeEstimateMicroStx: number;
  memo: string | null;
  recipients: DispersionRecipient[];
  contractCall: {
    contractAddress: string;
    contractName: string;
    functionName: "preview-single" | "preview-many";
    args: unknown[];
  };
  events: Array<{
    type: "stx_transfer_preview";
    sender: string;
    recipient: string;
    amountMicroStx: number;
    memo: string | null;
  }>;
  createdAt: string;
};

export type ApiError = {
  error: string;
  details?: string[];
};

export const CONTRACT = {
  address: "ST000000000000000000002AMW42H",
  name: "read-only-stx-dispersion",
  sourcePath: "contracts/read-only-stx-dispersion.clar",
  functions: [
    {
      name: "preview-single",
      access: "read_only",
      description: "Preview one STX transfer without broadcasting a transaction.",
    },
    {
      name: "preview-many",
      access: "read_only",
      description: "Preview a batch of STX transfers without broadcasting a transaction.",
    },
  ],
} as const;

const MICROSTX_PER_STX = 1_000_000;
const BASE_FEE_MICROSTX = 180;
const PER_RECIPIENT_FEE_MICROSTX = 45;
const MAX_RECIPIENTS = 200;
const MAX_MEMO_LENGTH = 64;
const STACKS_ADDRESS_PATTERN = /^S[PMTN][0-9A-HJKMNP-TV-Z]{20,40}$/;

export function buildPreview(input: DispersionPreviewInput): DispersionPreview {
  const sender = parseAddress(input.sender, "sender");
  const network = parseNetwork(input.network);
  const memo = parseMemo(input.memo);
  const recipients = parseRecipients(input);

  if (recipients.some((recipient) => recipient.address === sender)) {
    throw validationError("Sender cannot also be a recipient.");
  }

  const totalMicroStx = recipients.reduce(
    (total, recipient) => total + recipient.amountMicroStx,
    0,
  );

  if (!Number.isSafeInteger(totalMicroStx)) {
    throw validationError("Total amount exceeds JavaScript's safe integer range.");
  }

  const feeEstimateMicroStx =
    BASE_FEE_MICROSTX + recipients.length * PER_RECIPIENT_FEE_MICROSTX;
  const functionName =
    recipients.length === 1 ? "preview-single" : "preview-many";

  return {
    id: makePreviewId(sender, recipients, totalMicroStx, memo),
    mode: "read-only",
    status: "simulated",
    network,
    sender,
    recipientCount: recipients.length,
    totalMicroStx,
    feeEstimateMicroStx,
    memo,
    recipients,
    contractCall: {
      contractAddress: CONTRACT.address,
      contractName: CONTRACT.name,
      functionName,
      args:
        functionName === "preview-single"
          ? [
              sender,
              recipients[0].address,
              recipients[0].amountMicroStx,
              memo ?? "",
            ]
          : [
              sender,
              recipients.map((recipient) => ({
                wallet: recipient.address,
                amount: recipient.amountMicroStx,
              })),
              memo ?? "",
            ],
    },
    events: recipients.map((recipient) => ({
      type: "stx_transfer_preview",
      sender,
      recipient: recipient.address,
      amountMicroStx: recipient.amountMicroStx,
      memo: recipient.memo ?? memo,
    })),
    createdAt: new Date().toISOString(),
  };
}

export function toApiError(reason: unknown): ApiError {
  if (reason instanceof ValidationError) {
    return { error: "Invalid dispersion preview request.", details: reason.details };
  }

  return { error: "Unexpected dispersion preview error." };
}

function parseRecipients(input: DispersionPreviewInput): DispersionRecipient[] {
  const rawRecipients = Array.isArray(input.recipients)
    ? input.recipients
    : input.recipient
      ? [
          {
            address: input.recipient,
            amountMicroStx: input.amountMicroStx,
            amountStx: input.amountStx,
            memo: input.memo,
          },
        ]
      : [];

  if (rawRecipients.length === 0) {
    throw validationError("Provide either recipient or recipients.");
  }

  if (rawRecipients.length > MAX_RECIPIENTS) {
    throw validationError(`A preview can include at most ${MAX_RECIPIENTS} recipients.`);
  }

  return rawRecipients.map((recipient, index) =>
    parseRecipient(recipient, index),
  );
}

function parseRecipient(rawRecipient: unknown, index: number): DispersionRecipient {
  if (!isRecord(rawRecipient)) {
    throw validationError(`Recipient ${index + 1} must be an object.`);
  }

  return {
    address: parseAddress(rawRecipient.address, `recipients[${index}].address`),
    amountMicroStx: parseAmount(rawRecipient),
    memo: parseMemo(rawRecipient.memo),
  };
}

function parseAddress(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw validationError(`${fieldName} is required.`);
  }

  const address = value.trim().toUpperCase();

  if (!STACKS_ADDRESS_PATTERN.test(address)) {
    throw validationError(`${fieldName} must be a valid-looking Stacks address.`);
  }

  return address;
}

function parseAmount(rawRecipient: RecipientInput): number {
  if (rawRecipient.amountMicroStx !== undefined) {
    return parseMicroStx(rawRecipient.amountMicroStx, "amountMicroStx");
  }

  if (rawRecipient.amountStx !== undefined) {
    const amountStx = parseStx(rawRecipient.amountStx);
    return Math.round(amountStx * MICROSTX_PER_STX);
  }

  throw validationError("Each recipient needs amountMicroStx or amountStx.");
}

function parseMicroStx(value: unknown, fieldName: string): number {
  const amount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw validationError(`${fieldName} must be a positive safe integer.`);
  }

  return amount;
}

function parseStx(value: unknown): number {
  const amount =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw validationError("amountStx must be a positive number.");
  }

  if (!Number.isSafeInteger(Math.round(amount * MICROSTX_PER_STX))) {
    throw validationError("amountStx is too large.");
  }

  return amount;
}

function parseNetwork(value: unknown): Network {
  if (value === undefined || value === null || value === "") {
    return "testnet";
  }

  if (value === "mainnet" || value === "testnet" || value === "devnet") {
    return value;
  }

  throw validationError("network must be mainnet, testnet, or devnet.");
}

function parseMemo(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw validationError("memo must be a string.");
  }

  const memo = value.trim();

  if (memo.length > MAX_MEMO_LENGTH) {
    throw validationError(`memo cannot exceed ${MAX_MEMO_LENGTH} characters.`);
  }

  return memo || null;
}

function makePreviewId(
  sender: string,
  recipients: DispersionRecipient[],
  totalMicroStx: number,
  memo: string | null,
): string {
  const seed = [
    sender,
    totalMicroStx,
    memo ?? "",
    ...recipients.map((recipient) => `${recipient.address}:${recipient.amountMicroStx}`),
  ].join("|");

  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return `disp_${hash.toString(16).padStart(8, "0")}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validationError(detail: string): ValidationError {
  return new ValidationError([detail]);
}

class ValidationError extends Error {
  details: string[];

  constructor(details: string[]) {
    super(details.join(" "));
    this.name = "ValidationError";
    this.details = details;
  }
}
