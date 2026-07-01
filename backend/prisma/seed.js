const { prisma } = require("../config/database");
const bcrypt = require("bcrypt");

async function main() {
  const password = await bcrypt.hash("Admin123", 10);

  // delete child tables first

  await prisma.media.deleteMany();

  await prisma.feedback.deleteMany();

  await prisma.auditLog.deleteMany();

  await prisma.chatMessage.deleteMany();

  await prisma.chatSession.deleteMany();

  await prisma.articleEmbedding.deleteMany();

  await prisma.articleVersion.deleteMany();

  await prisma.article.deleteMany();

  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        name: "Admin",
        email: "admin@test.com",
        password_hash: password,
        role: "ADMIN",
        department: "IT",
      },

      {
        name: "Editor",
        email: "editor@test.com",
        password_hash: password,
        role: "EDITOR",
        department: "Support",
      },

      {
        name: "Viewer",
        email: "viewer@test.com",
        password_hash: password,
        role: "VIEWER",
        department: "Clinical",
      },
    ],
  });

  console.log("Users created successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);

    await prisma.$disconnect();

    process.exit(1);
  });
