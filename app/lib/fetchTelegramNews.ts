import { client } from "./telegram";

export async function fetchTelegramNews() {
  // Підключаємося до Telegram, якщо ще не підключені
  await client.connect();

  const channel = process.env.TG_CHANNEL!;

  // Отримуємо останні 20 повідомлень
  const messages = await client.getMessages(channel, {
    limit: 20,
  });

  // Формуємо масив постів
  const posts = messages.map((msg) => {
    return {
      telegramId: msg.id,
      content: msg.message || "",
      image: null, // Посилання більше не потрібне, ми качаємо бінарно
      date: msg.date,
      rawMessage: msg, // <--- Передаємо оригінальний msg, щоб syncNews міг дістати з нього медіа
    };
  });

  // Повертаємо об'єкт, який містить і пости, і екземпляр клієнта
  return { posts, client };
}
