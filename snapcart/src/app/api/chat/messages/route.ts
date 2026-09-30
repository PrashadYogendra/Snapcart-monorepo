import connectDb from "@/lib/db"
import Message from "@/models/message.models";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    try {
        await connectDb()
        const {roomID}=await req.json()
        const room=await Order.findById(roomID)
    if(!room){
        return NextResponse.json(
            {message:`room not found`},
            {status:400}
        )
    }
       const messages=await Message.find({roomID:room._id})

       return NextResponse.json(
        messages,{status:200}
       )
        
    } catch (error) {
        return NextResponse.json(
            {message:`get message error ${error}`},
            {status:500}
        )
    }
    
}