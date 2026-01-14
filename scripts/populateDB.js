import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

// Connect to MongoDB
const DB_URL = "mongodb://localhost:27017/ticketing-db";

mongoose
	.connect(DB_URL)
	.then(() => {
		console.log(`Connected to DB: ${DB_URL}`);
	})
	.catch((err) => {
		console.error("MongoDB connection error:", err);
	});

const users = [
	{ name: "user", email: "user@test.com", password: "password123", role: "user" },
	{ name: "admin", email: "admin@test.com", password: "password123", role: "admin" },
];

const status = ["open", "in progress", "closed"];
const priority = ["low", "medium", "high"];

async function deleteCollecitons() {
	try {
		await User.deleteMany({});
		console.log("Deleted user collection.");
		await Ticket.deleteMany({});
		console.log("Deleted ticket collection.");
	} catch (err) {
		console.error("Error deleting collections:", err);
	}
}

async function createUsers() {
	for (const userData of users) {
		const user = new User(userData);
		await user.save();
		console.log(`Created user: ${user.email}`);
	}
}
async function createTickets() {
	const allUsers = await User.find({});
	for (let i = 1; i <= 15; i++) {
		const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
		const ticket = new Ticket({
			id: uuidv4(),
			title: `Ticket ${i}`,
			description: `Description for ticket #${i}`,
			priority: priority[Math.floor(Math.random() * priority.length)],
			status: status[Math.floor(Math.random() * status.length)],
			assignedTo: randomUser.id,
			createdBy: randomUser.id,
		});
		await ticket.save();
		console.log(`Created ticket: ${ticket.title}`);
	}
}

async function populateDB() {
	try {
		await deleteCollecitons();
		await createUsers();
		await createTickets();
        console.log("Database population complete.");
	} catch (err) {
		console.error("Error populating database:", err);
	} finally {
		mongoose.connection.close();
	}
}
populateDB();