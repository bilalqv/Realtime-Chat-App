const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");

app.use(cors());
app.use(express.json());

const dbURI = "mongodb+srv://bilal:12345db@node-tuts.eg4cr8c.mongodb.net/chat-app-db";
const PORT = 4000;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true})
  .then((res) => {
    console.log("DB Connetion Successfull");
    
    const server = app.listen(PORT, () =>
      console.log(`Server started on ${PORT}`)
    );
    const io = socket(server, {
      cors: {
        origin: "http://localhost:3000",
        credentials: true,
      },
    });
    
    global.onlineUsers = new Map();
    io.on("connection", (socket) => {
      global.chatSocket = socket;
      socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
      });
    
      socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
          socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
      });
    });
    

  })
  .catch((err) => {
    console.log('url : ', dbURI);
    console.log(err.message);
    console.log(err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);