const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "./.env") });

const express = require("express");
const cors = require("cors");
const { initDatabase } = require("./db");


const authRoutes = require("./routes/auth");
const tasksRoutes = require("./routes/tasks");
const notesRoutes = require("./routes/notes");


const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: "https://good-notes-frontend.vercel.app/", 
    credentials: true
  
  })
);


app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/notes", notesRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GoodNotes server is running!" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    
    await initDatabase();
    console.log("✅ Database initialized successfully.");

    app.listen(PORT, () => {
      console.log(`\n🚀 GoodNotes server is running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
