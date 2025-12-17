import express from "express";
import mongoose from "mongoose";
import Ticket from "../models/Ticket.js";
import auth from "../middlewares/auth.js";
import admin from "../middlewares/admin.js";
import buildFilter from "../middlewares/filter.js";
import paginate from "../middlewares/paginate.js";

const router = express.Router();
//GET all tickets
//GET /api/tickets
//GET /api/tickets?page=1&pageSize=10&
//GET /api/tickets?status=open&priority=high&search=bug&createdBy=userid&assignedTo=userid
router.get("/", buildFilter, paginate(Ticket), async (req, res) => {
	res.status(200).json(req.paginatedResults);
});
//POST /api/tickets
router.post("/", auth, async (req, res) => {
	const ticket = new Ticket({
		title: req.body.title,
		description: req.body.description,
		priority: req.body.priority,
		status: req.body.status,
		assignedTo: req.body.assignedTo,
		createdBy: req.user._id,
	});

	try {
		const savedTicket = await ticket.save();
		res.status(201).json({ ticket: savedTicket });
	} catch (error) {
		res.status(500).send({ message: "Error creating ticket", error: error.message });
	}
});
//GET /api/tickets/:id
router.get("/:id", async (req, res) => {
	try {
		const ticket = await Ticket.findOne({ id: req.params.id });
		if (!ticket) {
			return res.status(404).send({ message: "Ticket not found" });
		}
		res.status(200).json({ ticket: ticket });
	} catch (error) {
		res.status(500).send({ message: "Error fetching ticket", error: error.message });
	}
});
//PUT /api/tickets/:id
router.put("/:id", auth, async (req, res) => {
	const updates = req.body;
	try {
		const updatedTicket = await Ticket.findOneAndUpdate({ id: req.params.id }, updates, { new: true });
		if (!updatedTicket) {
			return res.status(404).send({ message: "Ticket not found" });
		}
		res.status(200).json({ ticket: updatedTicket });
	} catch (error) {
		res.status(500).send({ message: "Error updating ticket", error: error.message });
	}
});
//DELETE /api/tickets/:id
router.delete("/:id", [auth, admin], async (req, res) => {
	try {
		const deletedTicket = await Ticket.findOneAndDelete({ id: req.params.id });
		if (!deletedTicket) {
			return res.status(404).send({ message: "Ticket not found" });
		}
		res.status(200).json({ message: "Ticket deleted successfully", ticket: deletedTicket });
	} catch (error) {
		res.status(500).send({ message: "Error deleting ticket", error: error.message });
	}
});

export default router;
