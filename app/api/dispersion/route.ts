import { CONTRACT } from "@/lib/dispersion";

export async function GET() {
  return Response.json({
    name: "Pay Split STX dispersion backend",
    mode: "read-only simulation",
    description:
      "Dummy backend for previewing STX dispersions to one wallet or many wallets. It does not sign transactions, store keys, or broadcast funds.",
    endpoints: {
      contract: "/api/dispersion/contract",
      preview: "/api/dispersion/preview",
    },
    contract: CONTRACT,
    samplePreviewRequest: {
      sender: "ST3J2GVMMM2R07ZFBJDWTYEYAR8FZH5WKDTFJ7MA4",
      recipient: "ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      amountStx: "1.25",
      memo: "June payout",
      network: "testnet",
    },
    sampleBatchPreviewRequest: {
      sender: "ST3J2GVMMM2R07ZFBJDWTYEYAR8FZH5WKDTFJ7MA4",
      memo: "Team split",
      recipients: [
        {
          address: "ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
          amountMicroStx: 750000,
        },
        {
          address: "ST1PQHQKV0RJXZFY13D2PNS7E7ZP4M9KAB3C5Z9Q6",
          amountStx: "0.5",
        },
      ],
    },
  });
}
