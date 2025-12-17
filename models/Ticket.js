import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ticketSchema = new mongoose.Schema(
	{
		id: { type: String, required: true, default: uuidv4 },
		assignedTo: { type: String, default: null, required: true },
		createdAt: { type: Date, required: true, default: Date.now },
		status: { type: String, required: true, enum: ["open", "in-progress", "closed"], default: "open" },
		priority: { type: String, required: true, enum: ["low", "medium", "high"], default: "low" },
		title: { type: String, required: true },
		description: { type: String, required: true },
		createdBy: { type: String, required: true },
	},
	{
		toJSON: {
			transform: function (doc, ret) {
				delete ret.__v;
				delete ret._id;
				return ret;
			},
			virtuals: true,
		},
	}
);

ticketSchema.index({ id: 1, assignedTo: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
