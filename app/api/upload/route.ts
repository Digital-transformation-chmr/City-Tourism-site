import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public/uploads");

    const urls: string[] = [];

    for (const file of files) {

      /* ❌ ВІДХИЛЯЄМО ВІДЕО */
      if (file.type.startsWith("video/")) {
        continue; // просто пропускаємо
      }

      /* ❌ ВІДХИЛЯЄМО НЕЗОБРАЖЕННЯ */
      if (!file.type.startsWith("image/")) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.type.split("/")[1] || "jpg";
      const filename = `${crypto.randomUUID()}.${ext}`;

      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);

      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}