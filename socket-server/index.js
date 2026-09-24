import express from "express"
import { Server, Socket } from "socket.io"
import http from "http"
import dotenv from "dotenv"
import axios from "axios"
dotenv.config()

const app=express()

const server=http.createServer(app)
const port=process.env.PORT || 5000


const io=new Server(server,{
    cors:{
        origin:process.env.NEXT_BASE_URL
    }
})

io.on("connection",(socket)=>{

    socket.on("identity",async (userId)=>{
        await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/connect`,{userId,socketId:socket.id})
    })

    socket.on("update-location",async({userId,latitude,longtitude})=>{
        const location={
            type:"Point",
            coordinates:[longtitude,latitude]
        }
         await axios.post(`${process.env.NEXT_BASE_URL}/api/socket/update-location`,
            {userId,location}
         )
    })

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id)

    })
})



server.listen(port,()=>{
    console.log("server started at",port)
})