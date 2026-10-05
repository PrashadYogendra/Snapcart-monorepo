import connectDb from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { orderId } = await req.json();
        const order = await Order.findById(orderId).populate("user");

        if (!order) {
            return NextResponse.json({
                message: "Order not found",
                status: 400,
            });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        order.deliveryOtp = otp;
        await order.save();

        console.log(`🔑 OTP for order ${order._id}: ${otp}`); // 👈 terminal mein OTP print hoga

        await sendMail(
            order.user.email,
            "Your OTP for order delivery",
            `<h2>Your OTP for order delivery is: <strong>${otp}</strong></h2>`
        );

        return NextResponse.json({
            message: "OTP sent successfully",
            status: 200,
        });
    } catch (error) {
        return NextResponse.json({
            message: `sent otp failed ${error}`,
            status: 500,
        });
    }
}