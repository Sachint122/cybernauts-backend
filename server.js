require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 Docs available on http://localhost:${PORT}/api-docs`);
  });
});
