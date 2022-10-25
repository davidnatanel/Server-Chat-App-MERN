const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const userRoutes = require("./routes/userRoutes")
const messageRoute = require("./routes/messagesRoute");
const socket  = require("socket.io");

const app= express();

require("dotenv").config()


app.use(cors({
  origin:"*"
}));
app.use(express.json());
app.get('/active', (req, res) => {
 
  res.send('active')
})

app.use("/api/auth",userRoutes);
app.use("/api/messages",messageRoute);

var UrlDB= process.env.NODE_ENV == 'production'? process.env.PRODUCTION_MONGO_URL:process.env.LOCAL_MONGO_URL ;


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
    origin:"*"
  }
})


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
