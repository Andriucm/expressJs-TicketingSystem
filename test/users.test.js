import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import server from "../server.js";
import User from "../models/User.js";

describe("Users API", () => {
	beforeAll(async () => {
		await User.deleteMany({});
	});

	afterAll(async () => {
		mongoose.connection.close();
		server.close();
	});

	test("create a new user", async () => {
		const response = await request(app).post("/api/users/signup").send({
			name: "Test User",
			email: "a@b.com",
			password: "password123",
			role: "user",
		});
		expect(response.status).toBe(201);
		expect(response.body).toHaveProperty("user");
		expect(response.body.user).toHaveProperty("name", "Test User");
		expect(response.body.user).toHaveProperty("email", "a@b.com");
		expect(response.body.user).toHaveProperty("role", "user");
		expect(response.body).toHaveProperty("token");
	});
});
