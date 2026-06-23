"use client";

import { useRouter } from "next/navigation";

type Place = {
  id: number;
  title: string;
  subtitle: string;
  type: string;
};

export default function SelectTableClient({
  places,
  page,
  totalPages,
}: {
  places: Place[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  const goToPage = (p: number) => {
    router.push(`/admin/select?page=${p}`);
  };

  const handleDelete = async (
    e: React.MouseEvent,
    id: number
  ) => {
    e.stopPropagation(); // ⚠️ щоб не відкривав edit

    const ok = confirm("Delete this place?");
    if (!ok) return;

    await fetch(`/api/places/${id}`, {
      method: "DELETE",
    });

    router.refresh();
  };

  return (
    <div className="space-y-4">

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Subtitle</th>
              <th className="p-3">Type</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {places.map((p) => (
              <tr
                key={p.id}
                onClick={() =>
                  router.push(`/admin/edit/${p.id}`)
                }
                className="border-t hover:bg-gray-50 cursor-pointer transition"
              >
                <td className="p-3 font-medium">
                  {p.title}
                </td>

                <td className="p-3 text-gray-500">
                  {p.subtitle}
                </td>

                <td className="p-3">{p.type}</td>

                <td className="p-3 text-right">
                  <button
                    onClick={(e) =>
                      handleDelete(e, p.id)
                    }
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex gap-2 justify-center mt-6">
        <button
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map(
          (_, i) => {
            const p = i + 1;

            return (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`px-3 py-1 border rounded ${
                  p === page
                    ? "bg-black text-white"
                    : ""
                }`}
              >
                {p}
              </button>
            );
          }
        )}

        <button
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}