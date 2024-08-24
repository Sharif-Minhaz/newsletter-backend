import asyncHandler from "express-async-handler";
import { isEmailValid, validateEmailWithMx, sendMail } from "../utils/index.js";
import Subscription from "../models/Subscription.model.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const subscribeController = asyncHandler(async (req, res) => {
	const { email } = req.body;

	const trimmedEmail = email?.trim();

	if (!trimmedEmail) {
		return res.status(400).json({
			success: false,
			message: "Email required",
		});
	}

	if (!isEmailValid(trimmedEmail)) {
		return res.status(400).json({
			success: false,
			message: "Email is not valid",
		});
	}

	if (!validateEmailWithMx(trimmedEmail)) {
		return res.status(400).json({
			success: false,
			message: "Email is not exists",
		});
	}

	await Subscription.create({ email: trimmedEmail });

	sendMail({
		to: trimmedEmail,
		subject: "Subscription notice",
		html: `
			<div style="font-family: Arial, Helvetica, sans-serif;">
				<h2>Welcome to "DEV Inertia" newsletter!</h2>
				<p>I will send a reminder if anything new added on my blog site. Stay tuned.</p>
				<p style="color: #cccccc;">No longer want to receive these emails? <a
						href="https://dev-inertia-newsletter.vercel.app/unsubscribe/${trimmedEmail}" style="color: grey;">Unsubscribe</a>.</p>
			</div>
		`,
	});

	res.status(201).json({
		success: true,
		message: "Subscribed successfully",
	});
});

const unsubscribeController = asyncHandler(async (req, res) => {
	const { email } = req.params;

	if (!email) {
		return res.status(400).json({
			success: false,
			message: "Email required",
		});
	}

	if (!isEmailValid(email)) {
		return res.status(400).json({
			success: false,
			message: "Email is not valid",
		});
	}

	await Subscription.findOneAndDelete({ email });

	res.redirect("https://dev-inertia-blog.netlify.app/");
});

const sendSubscribersMailController = asyncHandler(async (req, res) => {
	const { key, title, thumbnailUrl, details, link } = req.body;

	if (!title || !thumbnailUrl || !details || !key || !link) {
		return res.status(400).json({
			success: false,
			message: "Invalid and missing inputs",
		});
	}

	if (key !== process.env.ADMIN_KEY) {
		return res.status(401).json({
			success: false,
			message: `Wrong admin key`,
		});
	}

	const allSubscribers = await Subscription.find().lean();
	const subsInfo = allSubscribers.map((subscriber) => ({
		email: subscriber.email,
		name: subscriber.email?.split("@")[0],
	}));

	const subsPromise = subsInfo.map((info) => {
		return sendMail({
			to: info.email,
			subject: "Blog update",
			html: `
				<div style="font-family: Arial, Helvetica, sans-serif; background: #fafafa; padding: 20px;">
					<div style="background-color: white; padding: 20px; border-radius: 10px;">
						<h2>Hello, ${info.name}</h2>
						<p>📄 A new tech blog added, check it out.</p>
						<hr>
						<article>
							<h2>${title}</h2>
							<img style="border-radius: 10px;"
								src="${thumbnailUrl}" alt="">
							<p style="line-height: 1.5;">
							${details}... <a href="${link}">read more</a></p>
							<a href="https://dev-inertia-blog.netlify.app/blog/1"><button
									style="border: 2px solid rgb(0, 110, 255); background: white; padding: 14px 12px; border-radius: 10px; color: rgb(0, 145, 255)">LOAD
									MORE</button></a>
						</article>
						<p style="color: #cccccc">
							No longer want to receive these emails?
							<a href="https://dev-inertia-newsletter.vercel.app/unsubscribe/${info.email}" style="color: grey">Unsubscribe</a>.
						</p>
					</div>
				</div>
			`,
		});
	});

	await Promise.all(subsPromise);
	console.log("mail sent");

	res.redirect("/send");
});

const viewFormController = asyncHandler((req, res) => {
	res.status(200).sendFile(path.join(__dirname, "../public", "pages", "send-mail.html"));
});

export {
	subscribeController,
	unsubscribeController,
	sendSubscribersMailController,
	viewFormController,
};
