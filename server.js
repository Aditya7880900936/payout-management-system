require("dotenv").config();
require("./src/models");
const app = require("./app");
const sequelize = require("./src/config/database");

const PORT = process.env.PORT || 3000;

(async () => {
    try {

        await sequelize.authenticate();

        console.log("Database Connected");

        await sequelize.sync({ alter: true });

        console.log("Database Synced");

        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`);
        });

    } catch (err) {

        console.error(err);

    }
})();