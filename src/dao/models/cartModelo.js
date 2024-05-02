import mongoose from "mongoose";

const cartCollection = "cart";
const cartSchema = new mongoose.Schema(
    {
        products: [
            {
                _id: false,
                id: String,
                quantity: Number
            },
        ]
    },
    {
        timestamps: true
    }
)

export const cartModelo = mongoose.model(cartCollection, cartSchema)