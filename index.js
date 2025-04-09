
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);

const hostname = "0.0.0.0";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://homevisions.vercel.app",
    methods: ["GET", "POST"],
  },
});

const users = new Map(); // userId -> socketId

global.io = io;
global.users = users;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    users.set(userId, socket.id);
    console.log(`User ${userId} joined with socket ID ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

  socket.on("ping", (data) => {
    console.log("Received ping:", data);
    socket.emit("pong", { msg: "pong from server ✅" });
  });
});

app.get("/", (req, res) => {
  res.send("Socket server is running ✅");
});

server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
