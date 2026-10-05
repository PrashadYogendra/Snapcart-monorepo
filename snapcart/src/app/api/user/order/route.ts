import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.models";
import emitEventHandler from "@/lib/emitEventHandler";

export async function POST(req:NextRequest) {
    try {
        await connectDb()
        const { userId,items,paymentMethod,totalAmount,address}=await req.json()

        console.log("Received order payload:", {
          userId,
          itemsLength: items?.length,
          paymentMethod,
          totalAmount,
          address,
        })

        if(!items || !userId || !paymentMethod || totalAmount === undefined || totalAmount === null || !address){
            return NextResponse.json(
                {message:"please send all details"},
                {status:400}
            )
        }
        const user=await User.findById(userId)
        if(!user){
            return NextResponse.json(
                {message:"user not found"},
                {status:400}
            )
        }

        const newOrder=await Order.create({
            user:userId,
            items,
            paymentMethod,
            totalAmount,
            address
        })

        await emitEventHandler("new-order",newOrder)


        return NextResponse.json(
                newOrder,
                {status:201}
            )
    } catch (error) {
        return NextResponse.json(
                {message:`place order error ${error}`},
                {status:500}
            )
    }
    
}