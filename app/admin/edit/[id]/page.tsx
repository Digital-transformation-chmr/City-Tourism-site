"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminEditPage from "../page";

export default function EditPlaceById() {
  const params = useParams();
  const id = params.id as string;

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlace() {
      try {
        const res = await fetch(`/api/places/${id}`);

        if (!res.ok) {
          throw new Error("Place not found");
        }

        const data = await res.json();

        setPlace(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadPlace();
  }, [id]);

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!place) {
    return <div className="p-10">Place not found</div>;
  }

  return <AdminEditPage initialData={place} />;
}