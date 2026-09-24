import connectDb from "@/lib/db"
import DeliveryAssignment from "@/models/deliveryAssignment.model"
import Order from "@/models/order.model"
import User from "@/models/user.models"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
    try {
        await connectDb()
        const { orderId } = await params
        const { status } = await req.json()
        const order = await Order.findById(orderId).populate("user")
        if (!order) {
            return NextResponse.json(
                { message: "order not found" },
                { status: 400 }
            )
        }
        order.status = status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let deliveryBoysPayload: any = []

        if (status === "out of delivery" && !order.assignment) {
            const { latitude, longtitude } = order.address
            const nearbyDeliveryBoys = await User.find({
                role: "deliveryBoy",
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [Number(longtitude), Number(latitude)]
                        },
                        $maxDistance: 10000
                    }
                }
            })

            const nearyByIds = nearbyDeliveryBoys.map((b) => b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearyByIds },
                status: { $nin: ["broadcasted", "completed"] }
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(b => String(b)))
            const availableDeliveryBoys = nearbyDeliveryBoys.filter(
                b => !busyIdSet.has(String(b._id))
            )
            const candidates = availableDeliveryBoys.map(b => b._id)

            if (candidates.length == 0) {
                await order.save()
                return NextResponse.json(
                    { message: "there is no available Delivery boys" },
                    { status: 200 }
                )
            }

            const deliveryAssignment = await DeliveryAssignment.create({
                order: order._id,
                broadcastedTo: candidates,
                status: "broadcasted"
            })

            order.assignment = deliveryAssignment._id;
            deliveryBoysPayload = availableDeliveryBoys.map(b => ({
                id: b._id,
                name: b.name,
                mobile: b.mobile,
                latitude: b.location.coordinates[1],
                longtitude: b.location.coordinates[0]
            }))

            await deliveryAssignment.populate("order")
        }

        await order.save()
        await order.populate("user")

        return NextResponse.json({
            assignment: order.assignment?._id,
            availableBoys: deliveryBoysPayload
        }, { status: 200 })

    } catch (error) {
        console.log("full error:",error)
        return NextResponse.json({
            message: `update status error ${error}`
        }, { status: 500 })
    }
}