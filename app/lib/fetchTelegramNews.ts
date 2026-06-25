import { client } from "./telegram";

export async function fetchTelegramNews() {
  await client.connect();

  const channel = process.env.TG_CHANNEL!;

  const messages = await client.getMessages(channel, {
    limit: 20,
  });

  return messages.map((msg) => {
    const image =
      msg.media && "photo" in msg.media
        ? `https://api.telegram.org/file/...` // optional (можна доробити)
        : null;

    return {
      telegramId: msg.id,
      content: msg.message || "",
      image,
      date: msg.date,
    };
  });
}