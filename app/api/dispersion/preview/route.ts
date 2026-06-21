import { buildPreview, toApiError } from "@/lib/dispersion";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const preview = buildPreview(body);

    return Response.json({ ok: true, preview });
  } catch (reason) {
    return Response.json({ ok: false, ...toApiError(reason) }, { status: 400 });
  }
}
