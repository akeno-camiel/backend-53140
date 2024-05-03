import mongoose from "mongoose";

const cartCollection = "cart";
const cartSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    product: {
                        type: mongoose.Types.ObjectId,
                        ref: "products"
                    },
                    _id: String,
                    quantity: Number
                },
            ]
        }
    },
    {
        timestamps: true
    }
)

export const cartModelo = mongoose.model(cartCollection, cartSchema)