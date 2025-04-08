const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");




  const port = parseInt(process.env.PORT || "3000", 10);
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
 

 
const hostname = "0.0.0.0";
 

 
const handler =  app.getRequestHandler();

const users = new Map(); // userId -> socketId

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: "*",  
    },
  });


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
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
 