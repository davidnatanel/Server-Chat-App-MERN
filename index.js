const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoute");
const socket  = require("socket.io");


const app= express();

require("dotenv").config()


app.use(cors({
  origin:"*",
  credential:true
}));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.use("/api/auth",userRoutes);
app.use("/api/messages",messageRoute);

var UrlDB= 'mongodb+srv://davidgomez:davidgomez@cluster0.c4fjwjo.mongodb.net/?retryWrites=true&w=majority' || process.env.MONGO_URL;


mongoose.connect(UrlDB,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
.then(()=>{console.log('DB Connection successfull')})
.catch((err)=>{console.log(err.message)})


const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server Started on Port ${process.env.PORT}`);
})


//socket
const io = socket(server,{
    cors:{
      origin:"*",
          credential:true
    }
})
// const io = socket(server,{
//   cors:{
//       origin:"http://localhost:3000",
//       credential:true
//   }
// })


global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.message);
    }
  });

  socket.on('chat:typing',(data)=>{
    socket.broadcast.emit('chat:typing',data)
   })
  
});