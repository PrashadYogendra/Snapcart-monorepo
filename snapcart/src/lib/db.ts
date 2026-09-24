import mongoose from "mongoose";
import { cache } from "react";

const mongodbUrl = process.env.MONGODB_URL;

if (!mongodbUrl) {
    throw new Error("DB error");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if(!cached.promise) {
        cached.promise = mongoose.connect(mongodbUrl).then((conn) => 
        conn.connection
        )
    }
    try {
        const conn= await cached.promise
        return conn;
    }catch (error) {
        console.log("DB connection error",error);
}
}

export default cache(connectDB);