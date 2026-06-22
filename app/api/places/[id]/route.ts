import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const place = await prisma.place.findUnique({
    where: { id: Number(params.id) },
  });

  return Response.json(place);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const updated = await prisma.place.update({
    where: { id: Number(params.id) },
    data: body,
  });

  return Response.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.place.delete({
    where: { id: Number(params.id) },
  });

  return Response.json({ ok: true });
}