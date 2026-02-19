require("express-async-errors");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");

const authRoutes = require("./routes/auth.routes");
const moviesRoutes = require("./routes/movies.routes");
const playlistRoutes = require("./routes/playlist.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use(authRoutes);
app.use(moviesRoutes);
app.use(playlistRoutes);
app.use(profileRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno" });
});

module.exports = app;
