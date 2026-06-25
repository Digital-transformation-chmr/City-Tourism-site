# scripts/generate-session.py
import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession
import os
from dotenv import load_dotenv

load_dotenv()

api_id = int(os.getenv("TG_API_ID"))
api_hash = os.getenv("TG_API_HASH")
phone = input("📱 Введи номер +380: ")

async def main():
    client = TelegramClient(StringSession(), api_id, api_hash)
    
    await client.connect()
    
    if not await client.is_user_authorized():
        await client.send_code_request(phone)
        code = input("📨 Введи код: ")
        
        try:
            await client.sign_in(phone, code)
        except Exception as e:
            password = input("🔐 Введи пароль: ")
            await client.sign_in(password=password)
    
    print("✅ Увійшов!")
    print(f"📋 Session string:\n{client.session.save()}")
    
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())