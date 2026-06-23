import prisma from "@/app/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, context: Context) {
  const { id } = await context.params;

  const place = await prisma.place.findUnique({
    where: { id: Number(id) },
  });

  return Response.json(place);
}

export async function PATCH(req: Request, context: Context) {
  const { id } = await context.params;
  const body = await req.json();

  const updated = await prisma.place.update({
    where: { id: Number(id) },
    data: body,
  });

  return Response.json(updated);
}

export async function DELETE(req: Request, context: Context) {
  const { id } = await context.params;

  await prisma.place.delete({
    where: { id: Number(id) },
  });

  return Response.json({ ok: true });
}