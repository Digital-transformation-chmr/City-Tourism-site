"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminExcursionPage, { Excursion } from "../page";

export default function EditExcursionById() {
  const params = useParams();
  const id = params.id as string;

  const [excursion, setExcursion] = useState<Excursion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExcursion() {
      try {
        const res = await fetch(`/api/excursions/${id}`);

        if (!res.ok) {
          throw new Error("Excursion not found");
        }

        const data = await res.json();

        setExcursion({
          ...data,
          duration: Number(data.duration) || 120,
          placeIds: Array.isArray(data.placeIds)
            ? data.placeIds.map(Number)
            : [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadExcursion();
  }, [id]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!excursion) {
    return <div className="p-10">Excursion not found</div>;
  }

  return <AdminExcursionPage initialData={excursion} />;
}
