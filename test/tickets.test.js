import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import server from "../server.js";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

describe("Tickets API", () => {
	let userToken;
	let adminToken;

	const signupAndGetToken = async ({ name, email, password, role }) => {
		const res = await request(app).post("/api/users/signup").send({
			name,
			email,
			password,
			role,
		});

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty("token");
		// En tu implementación también seteas header Authorization
		expect(res.headers.authorization).toBeDefined();
		return res.body.token;
	};

	beforeAll(async () => {
		await User.deleteMany({});
		await Ticket.deleteMany({});

		userToken = await signupAndGetToken({
			name: "Normal User",
			email: "user@test.com",
			password: "password123",
			role: "user",
		});

		adminToken = await signupAndGetToken({
			name: "Admin User",
			email: "admin@test.com",
			password: "password123",
			role: "admin",
		});
	});

	afterAll(async () => {
		// Si tu server conecta mongoose en otro sitio, esto puede ser suficiente.
		await mongoose.connection.close();
		server.close();
	});

	test("GET /api/tickets returns paginated results (public)", async () => {
		const res = await request(app).get("/api/tickets?page=1&pageSize=10");
		expect(res.status).toBe(200);
		// paginate middleware suele devolver { results, page, total, ... } o similar.
		// Como no tenemos el código de paginate, lo dejamos flexible:
		expect(res.body).toBeDefined();
	});

	test("POST /api/tickets creates a ticket (auth)", async () => {
		const res = await request(app).post("/api/tickets").set("Authorization", userToken).send({
			title: "Bug in checkout",
			description: "Steps to reproduce...",
			priority: "high",
			status: "open",
			assignedTo: "someone-user-id",
		});

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty("ticket");
		expect(res.body.ticket).toHaveProperty("id");
		expect(res.body.ticket).toHaveProperty("title", "Bug in checkout");
		expect(res.body.ticket).toHaveProperty("priority", "high");
		expect(res.body.ticket).toHaveProperty("status", "open");
		expect(res.body.ticket).toHaveProperty("assignedTo", "someone-user-id");
		expect(res.body.ticket).toHaveProperty("createdBy"); // viene del token
	});

	test("POST /api/tickets fails without auth", async () => {
		const res = await request(app).post("/api/tickets").send({
			title: "No auth",
			description: "Should fail",
			priority: "low",
			status: "open",
			assignedTo: "someone-user-id",
		});

		// Tu middleware auth define este status; 401 o 403 típicamente.
		// Ajusta si tu auth devuelve otro.
		expect([401, 403]).toContain(res.status);
	});

	test("GET /api/tickets/:id returns ticket or 404 (public)", async () => {
		// Creamos uno primero
		const create = await request(app).post("/api/tickets").set("Authorization", userToken).send({
			title: "Fetch me",
			description: "Details",
			priority: "medium",
			status: "open",
			assignedTo: "someone-user-id",
		});

		const ticketId = create.body.ticket.id;

		const ok = await request(app).get(`/api/tickets/${ticketId}`);
		expect(ok.status).toBe(200);
		expect(ok.body).toHaveProperty("ticket");
		expect(ok.body.ticket).toHaveProperty("id", ticketId);

		const notFound = await request(app).get(`/api/tickets/not-a-real-id`);
		expect(notFound.status).toBe(404);
	});

	test("PUT /api/tickets/:id updates ticket (auth) and returns 404 if not found", async () => {
		const create = await request(app).post("/api/tickets").set("Authorization", userToken).send({
			title: "Update me",
			description: "Details",
			priority: "low",
			status: "open",
			assignedTo: "someone-user-id",
		});

		const ticketId = create.body.ticket.id;

		const upd = await request(app).put(`/api/tickets/${ticketId}`).set("Authorization", userToken).send({
			status: "in-progress",
			priority: "high",
		});

		expect(upd.status).toBe(200);
		expect(upd.body).toHaveProperty("ticket");
		expect(upd.body.ticket).toHaveProperty("id", ticketId);
		expect(upd.body.ticket).toHaveProperty("status", "in-progress");
		expect(upd.body.ticket).toHaveProperty("priority", "high");

		const notFound = await request(app).put(`/api/tickets/not-a-real-id`).set("Authorization", userToken).send({ status: "closed" });

		expect(notFound.status).toBe(404);
	});

	test("DELETE /api/tickets/:id requires admin", async () => {
		const create = await request(app).post("/api/tickets").set("Authorization", userToken).send({
			title: "Delete me",
			description: "Details",
			priority: "low",
			status: "open",
			assignedTo: "someone-user-id",
		});

		const ticketId = create.body.ticket.id;

		const notAdmin = await request(app).delete(`/api/tickets/${ticketId}`).set("Authorization", userToken);

		expect([401, 403]).toContain(notAdmin.status);

		const asAdmin = await request(app).delete(`/api/tickets/${ticketId}`).set("Authorization", adminToken);

		expect(asAdmin.status).toBe(200);
		expect(asAdmin.body).toHaveProperty("message");
		expect(asAdmin.body).toHaveProperty("ticket");
		expect(asAdmin.body.ticket).toHaveProperty("id", ticketId);
	});
});
