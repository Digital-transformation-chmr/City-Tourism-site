// import prisma from "./prisma";
// import { fetchTelegramNews } from "./fetchTelegramNews";

// export async function syncNews() {
//   const posts = await fetchTelegramNews();

//   let added = 0;

//   for (const post of posts) {
//     if (!post.content) continue;

//     await prisma.news.upsert({
//       where: { telegramId: post.telegramId },
//       update: {
//         content: post.content,
//         image: post.image,
//         publishedAt: new Date(post.date),
//       },
//       create: {
//         telegramId: post.telegramId,
//         content: post.content,
//         image: post.image,
//         publishedAt: new Date(post.date),
//       },
//     });

//     added++;
//   }

//   return { added };
// }