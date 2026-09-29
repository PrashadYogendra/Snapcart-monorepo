'use client'
import LiveMap from '@/components/LiveMap'
import { getSocket } from '@/lib/socket'
import { IUser } from '@/models/user.models'
import { RootState } from '@/redux/store'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import mongoose from 'mongoose'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export interface IOrder{
    _id?:mongoose.Types.ObjectId
    user:mongoose.Types.ObjectId
    items:[
        {
            grocery:mongoose.Types.ObjectId,
            name:string,
            price:string,
            unit:string,
            image:string,
            quantity:number
        }
    ],
    isPaid:boolean,
    totalAmount:string,
    paymentMethod:"cod" | "online",
    address:{
        fullName:string,
        mobile:string,
        city:string,
        state:string,
        pincode:string,
        fullAddress:string,
        latitude:number,
        longtitude:number
    }   
    assignment?:mongoose.Types.ObjectId
    assignedDeliveryBoy?:IUser
    status: "pending" | "out of delivery" | "delivered"
    createdAt?:Date
    updatedAt?:Date
}

interface ILocation{
    latitude:number,
    longtitude:number
}



function TrackOrder({params}:{params:{orderId:string}}) {
    const {userData}=useSelector((state:RootState)=>state.user)
    const {orderId}=useParams()
    const[order,setOrder]=useState<IOrder>()
    const router=useRouter()
    const [userLocation,setUserLocation]=useState<ILocation>(
        {
            latitude:0,
            longtitude:0
        }
    )
    const [deliveryBoyLocation,setDeliveryBoyLocation]=useState<ILocation>(
        {
            latitude:0,
            longtitude:0
        }
    )

    useEffect(()=>{
        const getOrder=async ()=>{
            try {
                const result=await axios.get(`/api/user/get-order/${orderId}`)
                setOrder(result.data)
                setUserLocation({
                    latitude:result.data.address.latitude,
                    longtitude:result.data.address.longtitude
                })
                setDeliveryBoyLocation({
                    latitude:result.data.assignedDeliveryBoy.location.coordinates[1],
                    longtitude:result.data.assignedDeliveryBoy.location.coordinates[0]
                })
            } catch (error) {
             console.log(error)   
            }
        }
        getOrder()
    },[userData?._id])


useEffect(():any=>{
  const socket=getSocket()
  socket.on("update-deliveryBoy-location",(data)=>{
        setDeliveryBoyLocation({
            latitude:data.location.coordinates?.[1] ?? data.location.latitude,
            longtitude:data.location.coordinates?.[0] ?? data.location.longtitude,
        })
    
  })
  return ()=>socket.off("update-deliveryBoy-location")
},[order])


  return (
    <div className='w-full min-h-screen bg-linear-to-b from-green-50 to-white'>
        <div className='max-w-2xl mx-auto pb-24'>
          <div className='sticky top-0 bg-white/80 backdrop:blur-xl p-4 border-b shadow flex gap-3
          items-center z-999'>
            <button className='p-2 bg-green-100 rounded-full'
            onClick={()=>router.back()}><ArrowLeft className='text-green-700' size={20}/></button>
            <div>
                <h2 className='text-xl font-bold'>Track Order</h2>
                <p className='text-sm text-gray-600'>order#{order?._id?.toString().slice(-6)}
                     <span className='text-green-700 font-semibold'>{order?.status}</span>
                </p>
            </div>
          </div>

         <div className='px-4 mt-6'>
          <div className='rounded-3xl overflow-hidden border shadow'>
            <LiveMap userLocation={userLocation} deliveryBoyLocation={deliveryBoyLocation}/>
          </div>
         </div>

        </div>
    </div>
  )
}

export default TrackOrder