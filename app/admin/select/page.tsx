import prisma from "@/app/lib/prisma";
import SelectTableClient from "./select-table-client";

export default async function SelectPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const limit = 20;
  const skip = (page - 1) * limit;

  const [places, total] = await Promise.all([
    prisma.place.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        subtitle: true,
        type: true,
      },
    }),
    prisma.place.count(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Places Admin
      </h1>

      <SelectTableClient
        places={places}
        page={page}
        totalPages={totalPages}
      />
    </div>
  );
}