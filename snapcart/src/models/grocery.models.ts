import mongoose from "mongoose";
import { JSX } from "react/jsx-runtime";

export interface IGrocery{
    map(arg0: (item: any, index: number) => JSX.Element): import("react").ReactNode;
    _id?:mongoose.Types.ObjectId,
    name:string,
    category:string,
    price:string,
    unit:string,
    image:string,
    createdAt?:Date,
    updateAt?:Date
}

const grocerySchema = new mongoose.Schema<IGrocery>({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            "Fruits & Vegetables",
            "Dairy & Eggs",
            "Rice, Atta & Grains",
            "Snacks & Biscuits",
            "Spices & Masalas",
            "Beverages & Drinks",
            "Personal Care",
            "Household Essentials",
            "Instant & Pacakaged Food",
            "Baby & Pet Care"
        ],
        required:true
    },
    price:{
        type:String,
        required:true
    },
     unit:{
        type:String,
        required:true,
        enum:[
            "kg",
            "g",
            "l",
            "ml",
            "pcs",
            "pack"
        ]
    },
     image:{
        type:String,
        required:true
    }

},{
    timestamps:true
})

const Grocery = mongoose.models.Grocery || mongoose.model("Grocery", grocerySchema)
export default Grocery