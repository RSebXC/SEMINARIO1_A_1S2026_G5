require("express-async-errors");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const tasksRoutes = require("./routes/tasks.routes");
const filesRoutes = require("./routes/files.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, service: "Node.js" }));

app.use(authRoutes);
app.use(tasksRoutes);
app.use(filesRoutes);

app.use(errorHandler);

module.exports = app;
