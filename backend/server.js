const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const socketSetup = require("./socket");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/messages", require("./routes/messages"));

app.get("/", (req, res) => {
  res.send("Chat API is running");
});

const server = http.createServer(app);

socketSetup(server);

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
