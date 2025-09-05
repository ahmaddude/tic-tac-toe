const express=require("express");

const app=express();

const path =require("path");

const http=require("http");

const {Server}=require("socket.io");

const server=http.createServer(app);

const io=new Server(server);

app.use(express.static(path.resolve("")));

let arr=[];
let playArr=[];

io.on("connection",(socket)=>{
    socket.on("find",(e)=>{

        if(e.name!=null){
            arr.push({name: e.name, socketId: socket.id});

            if(arr.length>=2){
                let p1obj={
                    p1name:arr[0].name,
                    p1value:"X",
                    p1move:"",
                    p1socketId: arr[0].socketId
                }
                let p2obj={
                    p2name:arr[1].name,
                    p2value:"O",
                    p2move:"",
                    p2socketId: arr[1].socketId
                }

                let obj={
                    p1:p1obj,
                    p2:p2obj,
                    sum:1
                }
                playArr.push(obj)

                // Only emit to these 2 specific players
                io.to(arr[0].socketId).emit("find",{allPlayers:playArr})
                io.to(arr[1].socketId).emit("find",{allPlayers:playArr})

                arr.splice(0,2)
            }
        }
    })

    socket.on("playing",(e)=>{
    // Find the game this player is in
    let objToChange = playArr.find(obj => 
        obj.p1.p1name === e.name || obj.p2.p2name === e.name
    )
    
    if(objToChange){
        if(e.value=="X"){
            // Find which player slot has this name
            if(objToChange.p1.p1name === e.name){
                objToChange.p1.p1move = e.id
            } else {
                objToChange.p2.p2move = e.id
            }
            objToChange.sum++
        }
        else if(e.value=="O"){
            // Find which player slot has this name
            if(objToChange.p1.p1name === e.name){
                objToChange.p1.p1move = e.id
            } else {
                objToChange.p2.p2move = e.id
            }
            objToChange.sum++
        }

        // Only emit to the 2 players in this specific game
        io.to(objToChange.p1.p1socketId).emit("playing",{allPlayers:playArr})
        io.to(objToChange.p2.p2socketId).emit("playing",{allPlayers:playArr})
    }
})

    socket.on("gameOver",(e)=>{
        playArr=playArr.filter(obj=>obj.p1.p1name!==e.name && obj.p2.p2name!==e.name)
    })
})




app.get("/",(req,res)=>{
    return res.sendFile("index.html")
});

server.listen(3000,()=>{
    console.log("server connected to 3000")
});