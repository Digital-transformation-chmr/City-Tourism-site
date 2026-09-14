"use client";

import { useRouter } from "next/navigation";

export default function ModeSwitch({ mode }: { mode: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={() => router.push("/admin/select?mode=select")}
        className={`px-3 py-1 border rounded ${
          mode === "select" ? "bg-black text-white" : ""
        }`}
      >
        Select
      </button>

      <button
        onClick={() => router.push("/admin/select?mode=delete")}
        className={`px-3 py-1 border rounded ${
          mode === "delete"
            ? "bg-red-600 text-white"
            : ""
        }`}
      >
        Delete mode
      </button>
    </div>
  );
}