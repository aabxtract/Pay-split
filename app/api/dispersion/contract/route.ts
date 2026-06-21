import { CONTRACT } from "@/lib/dispersion";

export async function GET() {
  return Response.json({
    contract: CONTRACT,
    readOnly: true,
    canTransferFunds: false,
    notes: [
      "This contract shape is for previews only.",
      "The matching Clarity source lives at contracts/read-only-stx-dispersion.clar.",
      "A real fund dispersion contract would need public functions, transaction signing, and wallet approval.",
    ],
  });
}
