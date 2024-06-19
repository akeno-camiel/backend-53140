import mongoose from "mongoose";

const ticketsCollection = "tickets";
const ticketSchema = new mongoose.Schema(
    {
        code: String,
        purchase_datetime: "timestamp",
        amount: Number,
        purchaser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        }        
    },
    {
        timestamps: true
    }
)

export const ticketModelo = mongoose.model(ticketsCollection, ticketSchema);