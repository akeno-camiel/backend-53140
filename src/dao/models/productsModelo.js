import mongoose from "mongoose";

const productsCollection = "products";
const productsSchema = new mongoose.Schema(
    {
        status: Boolean,
        title: { type: String, required: true },
        description: String,
        price: { type: Number, required: true },
        thumbnail: String,
        code: String,
        stock: Number,
        category: String
    },
    {
        timestamps: true
    }
)

export const productsModelo = mongoose.model(productsCollection, productsSchema)