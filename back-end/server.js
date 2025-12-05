const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connexion MongoDB
console.log("MONGO_URI =", process.env.MONGO_URI);

connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health Route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date(),
  });
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎵 Serveur démarré sur http://localhost:${PORT}`);
});
