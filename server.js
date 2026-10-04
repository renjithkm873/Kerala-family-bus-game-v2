const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, "public")));

const MAX = 15;
const ROOM = "FAMILY15";
const players = new Map(); // socket.id -> player
const seats = new Map();   // seat -> socket.id
let location = "Thrissur";
let started = false;

function snapshot(){
  return {
    max: MAX,
    location,
    started,
    players: [...players.values()].map(p => ({
      id:p.id, name:p.name, seat:p.seat, money:p.money, fish:p.fish, tea:p.tea
    }))
  };
}
function broadcast(){ io.to(ROOM).emit("state", snapshot()); }

io.on("connection", socket => {
  socket.on("join", ({name}) => {
    name = String(name || "").trim().slice(0,18);
    if(!name) return socket.emit("errorMsg","Please enter your name.");
    if(players.size >= MAX) return socket.emit("full");
    if([...players.values()].some(p => p.name.toLowerCase() === name.toLowerCase()))
      return socket.emit("errorMsg","That name is already in the bus.");

    const p = {id:socket.id,name,seat:null,money:1000,fish:0,tea:0};
    players.set(socket.id,p);
    socket.join(ROOM);
    socket.emit("joined",{id:socket.id});
    broadcast();
  });

  socket.on("sit", seat => {
    seat = Number(seat);
    const p = players.get(socket.id);
    if(!p || seat < 1 || seat > 12) return;
    if(seats.has(seat)) return socket.emit("errorMsg","That seat is occupied.");
    if(p.seat) seats.delete(p.seat);
    p.seat = seat; seats.set(seat,socket.id);
    broadcast();
  });

  socket.on("start",()=>{
    if(!players.has(socket.id)) return;
    started = true; location = "Kerala Road"; broadcast();
  });

  socket.on("activity", kind=>{
    const p = players.get(socket.id);
    if(!p) return;
    if(kind==="tea"){
      if(p.money<20) return socket.emit("errorMsg","Not enough virtual money.");
      p.money-=20; p.tea++; location="Tea Shop";
    } else if(kind==="fish"){
      if(!started) return socket.emit("errorMsg","Start the journey first.");
      const earned=Math.floor(Math.random()*81)+20;
      p.fish++; p.money+=earned; location="Backwater Fishing Spot";
    } else if(kind==="snack"){
      if(p.money<30) return socket.emit("errorMsg","Not enough virtual money.");
      p.money-=30; location="Roadside Snack Shop";
    } else if(kind==="explore"){
      location="Kerala Village";
    }
    broadcast();
  });

  socket.on("scene", kind=>{
    if(!players.has(socket.id)) return;
    if(kind==="forest") location="Forest Wildlife";
    else if(kind==="sea") location="Sea Coast";
    else if(kind==="rail") location="Railway Crossing";
    else location="Kerala Village";
    broadcast();
  });

  socket.on("activity", kind=>{
    if(kind!=="spot") return;
    const p=players.get(socket.id);
    if(!p) return;
    p.money += 100;
    broadcast();
  });

  socket.on("disconnect",()=>{
    const p=players.get(socket.id);
    if(p?.seat) seats.delete(p.seat);
    players.delete(socket.id);
    broadcast();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>console.log(`Kerala Family Bus running on port ${PORT}`));
