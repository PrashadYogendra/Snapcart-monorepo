"use client";
import { getSocket } from "@/lib/socket";
import { RootState } from "@/redux/store";
import axios from "axios";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DeliveryChat from "./DeliveryChat";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

interface ILocation {
  latitude: number;
  longtitude: number;
}

function DeliveryBoyDashboard({ earning }: { earning: number }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const { userData } = useSelector((state: RootState) => state.user);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [showOtpBox, setShowOtpBox] = useState(false);
  const [otp, setOtp] = useState("");
  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longtitude: 0,
  });
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longtitude: 0,
  });

  const fetchAssignments = async () => {
    try {
      const result = await axios.get("/api/delivery/get-assignments");
      setAssignments(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCurrentOrder = async () => {
    try {
      const result = await axios.get("/api/delivery/current-order");
      if (result.data.active) {
        setActiveOrder(result.data.assignment);
        setUserLocation({
          latitude: result.data.assignment.order.address.latitude,
          longtitude: result.data.assignment.order.address.longtitude,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!userData?._id) return;
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setDeliveryBoyLocation({
          latitude: lat,
          longtitude: lon,
        });
        socket.emit("update-location", {
          userId: userData?._id,
          latitude: lat,
          longtitude: lon,
        });
      },
      (err) => {
        console.log(err);
      },
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [userData?._id]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("new-assignment", (assignment) => {
      setAssignments((prev) => [...prev, assignment]);
    });

    return () => {
      socket.off("new-assignment");
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.on("update-deliveryBoy-location", (data: any) => {
      setDeliveryBoyLocation({
        latitude: data.location.coordinates?.[1] ?? data.location.latitude,
        longtitude: data.location.coordinates?.[0] ?? data.location.longtitude,
      });
    });
    return () => {
      socket.off("update-deliveryBoy-location");
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCurrentOrder();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAssignments();
  }, [userData]);

  const handleAccept = async (id: string) => {
    try {
      await axios.get(`/api/delivery/assignment/${id}/accept-assignment`);
      await fetchCurrentOrder();
      setAssignments([]);
    } catch (error) {
      console.log(error);
    }
  };

  const sendOtp = async () => {
    try {
      const result = await axios.post("/api/delivery/otp/send", {
        orderId: activeOrder.order._id,
      });
      console.log(result.data);
      setShowOtpBox(true);
    } catch (error) {
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await axios.post("/api/delivery/otp/verify", {
        orderId: activeOrder.order._id,
        otp,
      });
      console.log(result.data);
      if (result.data.status === 200) {
        window.location.reload()
      } else {
        alert(result.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!activeOrder && assignments.length === 0) {
    const todayEarning = [
      {
        name: "Today",
        earning,
        deliveries: earning / 40,
      },
    ];

    return (
      <div
        className="flex items-center justify-center min-h-screen bg-linear-to-br from-white
      to-green-50 p-6"
      >
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            No Active Deliveries 🚚
          </h2>
          <p className="text-gray-500 mb-5">
            Stay online to receive new orders
          </p>

          <div className="bg-white border rounded-xl shadow p-6">
            <h2 className="font-medium text-green-700 mb-2">
              Today&apos;s Performance
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={todayEarning}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Legend />
                <Tooltip />
                <Bar dataKey="earning" name="Earnings (₹)" />
                <Bar dataKey="deliveries" name="Deliveries" />
              </BarChart>
            </ResponsiveContainer>

            <p className="mt-4 text-lg font-bold text-green-700">{earning || 0}₹ Earned today</p>
            <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white
            py-2 rounded-lg" onClick={()=>window.location.reload()}>Refresh Earning</button>


          </div>
        </div>
      </div>
    );
  }

  if (activeOrder && userLocation) {
    return (
      <div className="p-4 pt-30 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Active Delivery
          </h1>
          <p className="text-gray-600 text-sm mb-4">
            active#{activeOrder.order._id.slice(-6)}
          </p>

          <div className="rounded-xl border shadow-lg overflow-hidden mb-6">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>
          <DeliveryChat
            orderId={activeOrder.order._id}
            deliveryBoyId={userData?._id!}
          />

          <div className="mt-6 bg-white rounded-xl border shadow p-6">
            {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
              <button
                onClick={sendOtp}
                className="w-full py-4 bg-green-600 text-white rounded-lg"
              >
                Mark as Delivered
              </button>
            )}

            {!activeOrder.order.deliveryOtpVerification && showOtpBox && (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="w-full border rounded-lg px-4 py-3"
                />
                <button
                  onClick={verifyOtp}
                  className="w-full py-4 bg-green-600 text-white rounded-lg"
                >
                  Verify OTP
                </button>
              </div>
            )}

            {activeOrder.order.deliveryOtpVerification && (
              <p className="text-green-700 font-semibold text-center">
                Order delivered successfully.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mt-[120px] mb-[30px]">
          Delivery Assignment
        </h2>
        {assignments.map((a) => (
          <div
            key={a._id}
            className="p-5 bg-white rounded-xl shadow mb-4 border"
          >
            <p>
              <b>Order Id </b> #{a?.order._id.slice(-6)}
            </p>
            <p className="text-gray-600">{a.order.address.fullAddress}</p>

            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                onClick={() => handleAccept(a._id)}
              >
                Accept
              </button>
              <button className="flex-1 bg-red-600 text-white py-2 rounded-lg">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryBoyDashboard;