import mongoose from "mongoose";
const { model, Schema } = mongoose;

const subscriptionSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
	},
	{ timestamps: true }
);

const Subscription = model("Subscription", subscriptionSchema);

export default Subscription;
