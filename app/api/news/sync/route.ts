// import { NextResponse } from "next/server";
// import { syncNews } from "@/app/lib/syncNews";

// export async function GET() {
//   try {
//     const result = await syncNews();

//     return NextResponse.json({
//       success: true,
//       ...result,
//     });
//   } catch (e) {
//     return NextResponse.json(
//       { success: false, error: String(e) },
//       { status: 500 }
//     );
//   }
// }