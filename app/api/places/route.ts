import  prisma  from "@/app/lib/prisma";
//GET
  export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? "";
    const exclude = searchParams.get("exclude")?.split(",") ?? [];

    const places = await prisma.place.findMany({
      where: {
        AND: [
          exclude.length
            ? {
                NOT: {
                  type: {
                    in: exclude,
                  },
                },
              }
            : {},
          search
            ? {
                OR: [
                  {
                    title: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    tags: {
                      has: search,
                    },
                  },
                ],
              }
            : {},
        ],
      },
    });

    return Response.json(places);
  }

//////////////////////////////////////////////////////////////

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