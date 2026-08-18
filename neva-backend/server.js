const express = require('express');
const sequelize = require('./config/database');
const config = require('./config');
const app = express();
const PORT = config.port;
app.use(express.json());

const authRoutes = require('./routes/authRoutes');


app.use('/api/auth', authRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync({ force: false });
    console.log('Database models synced.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
