require("dotenv").config();

const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const { connectDatabase } = require("./config/database");

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use(helmet());

app.use(morgan("dev"));

// routes

app.use("/api/v1/auth", require("./routes/authRoutes"));

app.use("/api/v1/articles", require("./routes/articleRoutes"));

app.use("/api/v1/search", require("./routes/searchRoutes"));

app.use("/api/v1/chat", require("./routes/chatRoutes"));
app.use("/api/v1/categories", require("./routes/categoryRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));

// start database then server

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
