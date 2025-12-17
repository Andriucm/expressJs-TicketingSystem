import "dotenv/config";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

//POST /api/users/signup
router.post("/signup", async (req, res) => {
	let user;
	user = await User.findOne({ email: req.body.email });

	if (user) {
		return res.status(400).send({ message: "User already exists" });
	}

	user = new User({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		role: req.body.role,
	});

	try {
		await user.save();
		const token = jwt.sign(
			{
				_id: user.id,
				role: user.role,
			},
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);
		res.status(201)
			.header("Authorization", token)
			.send({
				user: {
					name: user.name,
					email: user.email,
					role: user.role,
				},
				token,
			});
	} catch (error) {
		console.error("Signup error:", error);
		return res.status(500).send({
			message: "Error creating user",
			error: error.message,
			stack: error.stack,
		});
	}
});

//POST /api/users/login
router.post("/login", async (req, res) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return res.status(400).send({ message: "Invalid email or password" });
	}
	const isMatch = await bcrypt.compare(req.body.password, user.password);
	if (!isMatch) {
		return res.status(400).send({ message: "Invalid email or password" });
	}
	const token = jwt.sign(
		{
			_id: user.id,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "1h" }
	);
	res.status(200).header("Authorization", token).json({
		token: token,
	});
});

export default router;
