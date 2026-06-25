// import Image from "next/image";
// // або де ти зберігаєш типи

// interface NewsCardProps {
//   item: NewsItem;
// }
// export interface NewsItem {
//   id: string;
//   title: string;
//   description: string;
//   image: string;
//   date?: string;
//   category?: string;
// }

// export function NewsCard({ item }: NewsCardProps) {
//   return (
//     <a
//       href={`/site/news/${item.id}`}
//       className="
//         group
//         relative
//         flex flex-col
//         overflow-hidden
//         rounded-2xl
//         border border-white/10
//         bg-black/40
//         backdrop-blur-md
//         shadow-lg
//         transition-all
//         duration-300
//         hover:-translate-y-1
//         hover:border-white/20
//         hover:shadow-2xl
//       "
//     >
//       {/* Image */}
//       <div className="relative">
//         <Image
//           alt={item.title}
//           src={item.image}
//           width={500}
//           height={300}
//           className="
//             h-56
//             w-full
//             object-cover
//             transition-transform
//             duration-500
//             group-hover:scale-105
//           "
//         />

//         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

//         {item.category && (
//           <span
//             className="
//               absolute
//               left-3
//               top-3
//               rounded-full
//               bg-black/40
//               px-3
//               py-1
//               text-xs
//               text-white
//               backdrop-blur-md
//             "
//           >
//             {item.category}
//           </span>
//         )}
//       </div>

//       {/* Content */}
//       <div className="flex flex-1 flex-col p-4">
//         {item.date && (
//           <span className="text-xs text-white/50 mb-2">
//             {item.date}
//           </span>
//         )}

//         <h3 className="mb-2 text-lg font-semibold text-white">
//           {item.title}
//         </h3>

//         <p className="line-clamp-3 text-sm text-white/70">
//           {item.description}
//         </p>

//         <div className="mt-auto pt-4">
//           <span className="inline-flex items-center gap-2 text-sm font-medium text-blue-300">
//             Читати далі
//             <span className="transition-transform duration-300 group-hover:translate-x-1">
//               →
//             </span>
//           </span>
//         </div>
//       </div>
//     </a>
//   );
// }

// interface NewsGridProps {
//   items: NewsItem[];
// }

// export default function NewsGrid({ items }: NewsGridProps) {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
//       {items.map((item) => (
//         <NewsCard key={item.id} item={item} />
//       ))}
//     </div>
//   );
// }