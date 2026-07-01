const { prisma } = require("../config/database");

async function main() {
  await prisma.category.deleteMany();

  await prisma.category.createMany({
    data: [
      {
        name: "HMIS",
        slug: "hmis",
      },

      {
        name: "Authentication",
        slug: "authentication",
      },

      {
        name: "User Guide",
        slug: "user-guide",
      },

      {
        name: "Healthcare",
        slug: "healthcare",
      },
    ],
  });

  console.log("Categories created");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
  });
