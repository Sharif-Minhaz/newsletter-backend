import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
const app = express();
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import {
	sendSubscribersMailController,
	subscribeController,
	unsubscribeController,
	viewFormController,
} from "./controllers/subscription.controller.js";

// Get the filename of the current module
const __filename = fileURLToPath(import.meta.url);

// Get the directory name of the current module
const __dirname = path.dirname(__filename);

//set middlewares and routes
app.use([
	cors(),
	express.static(path.join(__dirname, "public")),
	express.json(),
	express.urlencoded({ extended: true }),
]);

app.post("/subscribe", subscribeController);
app.get("/unsubscribe/:email", unsubscribeController);
app.get("/send", viewFormController);
app.post("/send", sendSubscribersMailController);

const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
	res.status(404).json({ message: "Page not found", success: false });
});

app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({
		success: false,
		message: err.message,
		error: err.code,
	});
});

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		app.listen(PORT, () => {
			console.info(`Server running at http://localhost:${PORT}`);
		});
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
