import "dotenv/config";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
// @ts-ignore
import input from "input";

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH!;
const stringSession = new StringSession("");

if (!apiId || !apiHash) {
  throw new Error("❌ TG_API_ID або TG_API_HASH не завантажились");
}

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber: async () => {
        let number = await input.text("📱 Введи номер з +380: ");
        number = number.replace(/[^\d+]/g, "");
        if (!number.startsWith("+")) number = "+" + number;
        console.log(`✅ Номер: ${number}`);
        return number;
      },

      phoneCode: async () => {
        console.log("⏳ Чекаємо код з SMS/Telegram...");
        const code = await input.text("📨 Введи код: ");
        return code.trim();
      },

      password: async () => {
        console.log("🔐 Потрібен пароль 2FA");
        const password = await input.text("Введи пароль: ");
        return password;
      },

      onError: (err) => {
        console.error("❌ Помилка:", err.message || err);
      },
    });

    console.log("✅ Успішно увійшов!");
    const me = await client.getMe();
    console.log(`👤 Користувач: ${me.firstName}`);

    console.log("\n🔥 ТВІЙ SESSION STRING:\n");
    console.log(client.session.save());

    await client.sendMessage("me", { message: "Привіт!" });

  } catch (error) {
    console.error("💥 Помилка:", error);
  }
})();