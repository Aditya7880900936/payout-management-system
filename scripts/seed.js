require("dotenv").config();

const sequelize = require("../src/config/database");

// Register all models & associations
require("../src/models");

const { User, Sale } = require("../src/models");

(async () => {
  try {
    // Fresh database
    await sequelize.sync({ force: true });

    console.log("Database recreated.");

    // Create users
    const john = await User.create({
      username: "john_doe",
      withdrawableBalance: 0,
    });

    const alice = await User.create({
      username: "alice",
      withdrawableBalance: 0,
    });

    console.log("Users Created:");
    console.log(john.toJSON());
    console.log(alice.toJSON());

    // Create sales
    const createdSales = await Sale.bulkCreate(
      [
        {
          userId: john.id,
          brand: "brand_1",
          earning: 40,
          status: "pending",
        },
        {
          userId: john.id,
          brand: "brand_2",
          earning: 50,
          status: "pending",
        },
        {
          userId: john.id,
          brand: "brand_3",
          earning: 30,
          status: "pending",
        },
        {
          userId: alice.id,
          brand: "brand_1",
          earning: 80,
          status: "pending",
        },
        {
          userId: alice.id,
          brand: "brand_2",
          earning: 60,
          status: "pending",
        },
      ],
      {
        validate: true,
        returning: true,
      }
    );

    console.log("\nBulkCreate Returned:", createdSales.length);

    // Verify data actually exists
    const users = await User.findAll({ raw: true });
    const sales = await Sale.findAll({ raw: true });

    console.log("\nUsers in DB:", users.length);
    console.table(users);

    console.log("\nSales in DB:", sales.length);
    console.table(sales);

    console.log("\n✅ Seed completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Seed Failed");
    console.error(err);
    process.exit(1);
  }
})();