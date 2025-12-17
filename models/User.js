import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
	{
		id: { type: String, required: true, default: uuidv4 },
		name: { type: String, required: true },
		role: { type: String, required: true, enum: ["user", "admin"], default: "user" },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true, minglength: 8, trim: true },
	},
	{
		toJSON: {
			virtuals: true,
			transform(doc, ret) {
				delete ret.password;
				delete ret.__v;
				delete ret._id;
				return ret;
			},
		},
	}
);

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index({ id: 1, email: 1 });

const User = mongoose.model("User", userSchema);
export default User;
