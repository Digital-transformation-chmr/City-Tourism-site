import "dotenv/config";
import { syncNews } from "@/app/lib/syncNews";

async function run() {
  console.log("🚀 Sync loop started");

  await syncNews();

  setInterval(async () => {
    console.log("🔄 Running sync...");
    await syncNews();
  }, 5 * 60 * 1000);
}

run();