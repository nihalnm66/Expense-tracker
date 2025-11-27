const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const notesRoutes = require("./routes/notes");
const aiRoutes = require("./routes/ai");

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ SERVE FRONTEND FILES
app.use(express.static("public"));  // VERY IMPORTANT

// ✅ API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/summarize", aiRoutes);

// ❌ REMOVE THIS (CAUSES REFRESH)
// app.get("*", (req, res) => {
//   res.sendFile(__dirname + "/public/index.html");
// });

// ✅ ONLY THIS SHOULD REMAIN (optional for deployment)
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/public/index.html");
// });

// DATABASE
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
