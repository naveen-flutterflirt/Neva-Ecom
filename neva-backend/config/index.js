require('dotenv').config();
module.exports = {
  port: parseInt(process.env.PORT, 10),
  databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : null,
};
