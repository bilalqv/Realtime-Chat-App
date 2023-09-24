const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require('dotenv').config();

app.use(cors());
app.use(express.json());

const dbURL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 4000;

mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true})
  .then((res) => {
    console.log("DB Connetion Successfull");
    
    const server = app.listen(PORT, () =>
      console.log(`Server started on ${PORT}`)
    );
    const io = socket(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
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
    console.log('url : ', dbURL);
    console.log(err.message);
    console.log(err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);