import "dotenv/config"; // Додайте цей імпорт на самому початку
import bcrypt from "bcrypt";
import prisma from "../app/lib/prisma";

async function main() {
    console.log("DATABASE_URL exists:", Boolean(process.env.DATABASE_URL));
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error(
      'Використання: npm run create-admin -- "Імʼя" "email" "пароль"'
    );
    process.exit(1);
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedName) {
    console.error("Помилка: ім'я не може бути порожнім.");
    process.exit(1);
  }

  if (!normalizedEmail.includes("@")) {
    console.error("Помилка: введіть коректний email.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Помилка: пароль повинен містити мінімум 8 символів.");
    process.exit(1);
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingAdmin) {
    console.error(
      `Помилка: адмін з email "${normalizedEmail}" вже існує.`
    );
    process.exit(1);
  }

  const keyHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: {
      name: normalizedName,
      email: normalizedEmail,
      keyHash,
      role: "admin",
      active: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });

  console.log("\nАдміна створено:");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error("\nПомилка створення адміна:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });