import { prisma } from "@src/database/index";

async function main() {
  const role = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Administrator role with full permissions",
    },
  });

  console.log("Seeded role:", role);
}

main()
  .then(() => {
    console.log("Seeding finished");
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
