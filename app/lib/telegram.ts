import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

const apiId = Number(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH!;
const stringSession = new StringSession(process.env.TG_SESSION || "");

export const client = new TelegramClient(
  stringSession,
  apiId,
  apiHash,
  {
    connectionRetries: 5,
  }
);