import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
	const token = req.get("Authorization").replace("Bearer ", "");
	if (!token) return res.status(401).json({ message: "No token provided" });

	try {
		const verified = jwt.verify(token, process.env.JWT_SECRET);
		req.user = verified;

		next();
	} catch (error) {
		return res.status(400).json({ message: "Invalid token", error });
	}
}
