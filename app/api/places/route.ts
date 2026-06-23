import  prisma  from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const tagsParam = searchParams.get("tags");

    // /api/places?tags=парк,музей
    if (tagsParam) {
      const tags = tagsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const places = await prisma.place.findMany({
        where: {
          tags: {
            hasSome: tags, // 👈 ключовий момент Prisma (PostgreSQL array)
          },
        },
      });

      return Response.json(places);
    }

    // якщо нічого не передали — повертаємо все
    const places = await prisma.place.findMany();

    return Response.json(places);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  const body = await req.json();

  const place = await prisma.place.create({
    data: {
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,

      images: body.images ?? [],

      yearBuilt: Number(body.yearBuilt),
      status: body.status,
      type: body.type,
      visiting: body.visiting,

      address: body.address,
      lat: Number(body.lat),
      lng: Number(body.lng),

      openingHours: body.openingHours,

      phone: body.phone ?? null,
      website: body.website ?? null,

      tags: body.tags ?? [],
    },
  });

  return Response.json(place);
}