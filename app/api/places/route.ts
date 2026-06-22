import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const places = await prisma.place.findMany();
  return Response.json(places);
}

export async function POST(req: Request) {
  const body = await req.json();

  const place = await prisma.place.create({
    data: body,
  });

  return Response.json(place);
}