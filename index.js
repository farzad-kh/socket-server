const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://homevisions.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});


app.use(express.json());

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId); // ✅ join the user to a room with their ID
    console.log(`✅ User ${userId} joined room ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });

  socket.on("ping", (data) => {
    console.log("📡 Received ping:", data);
    socket.emit("pong", { msg: "pong from server ✅" });
  });
});


app.post("/emit-message", (req, res) => {
  const { toUserId, message, unreadCount } = req.body;

  if (!toUserId || !message) {
    return res.status(400).json({ error: "Missing toUserId or message" });
  }

  console.log(`📨 Emitting message to room ${toUserId}`);

  io.to(toUserId).emit("new_message", {
    message,
    unreadCount,
  });

  res.json({ status: "Message emitted ✅" });
});

app.get("/", (req, res) => {
  res.send("🚀 Socket server is running ✅");
});

server.listen(port, hostname, () => {
  console.log(`> Ready on http://${hostname}:${port}`);
});
