import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/app/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

function parseContent(content: string = "") {
  const clean = content
    .replace(/Підписуйтесь на канал:[\s\S]*/g, "")
    .replace(/🎭 Запропонувати подію.*/g, "")
    .replace(/📩 Замовити рекламу.*/g, "")
    .trim();

  const lines = clean.split("\n").map(l => l.trim()).filter(Boolean);

  let title = lines[0] || "Новина";

  title = title.replace(
    /^(📌|🎶|🚀|👋|🎙️|💃|☀️|💜|🌲)\s*/i,
    ""
  );

  return {
    title,
    paragraphs: lines.slice(1),
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const parsedId = Number(id);

  if (isNaN(parsedId)) {
    notFound();
  }

  const article = await prisma.news.findUnique({
    where: {
      id: parsedId,
    },
  });

  if (!article) {
    notFound();
  }

  const { title, paragraphs } = parseContent(article.content);
  const image = article.image || "/Banners/banner3.png";

  return (
    <div className="text-white/80 min-h-screen">

      {/* HERO */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* CONTENT */}
      <div className="px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6 border border-white/30 p-5 rounded-2xl bg-black/40">

          <span className="text-xs px-2 py-1 border border-white/20 bg-white/5 rounded-lg inline-block">
            {article.content?.includes("☀️") ? "Погода" : "Новини"}
          </span>

          <h1 className="text-4xl font-bold">{title}</h1>

          <div className="space-y-4 text-lg leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

        </div>

        {/* RIGHT */}
        <aside className="bg-black/40 border border-white/30 rounded-xl p-5 space-y-4">

          <p className="text-lg font-semibold">📌 Інфо</p>

          <div className="text-sm text-white/60 space-y-3">
            <p>Новина завантажена напряму з бази даних.</p>
            <p className="text-xs text-white/40">
              Дані відображаються в реальному часі.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}