import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
	console.log(`Environment Variables: ${process.env.NODE_ENV}`);
	console.log(`Server is running on http://localhost:${PORT}`);
});

export default server;