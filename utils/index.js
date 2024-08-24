import dotenv from "dotenv";
dotenv.config();

import emailValidator from "node-email-verifier";
import nodemailer from "nodemailer";

const isEmailValid = (email) => {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
};

async function validateEmailWithMx(email) {
	try {
		const isValid = await emailValidator(email, { checkMx: true });
		return isValid;
	} catch (error) {
		console.error("Error validating email with MX checking:", error);
		return false;
	}
}

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false, // Use `true` for port 465, `false` for all other ports
	auth: {
		user: process.env.SMTP_USERNAME,
		pass: process.env.SMTP_PASSWORD,
	},
});

const sendMail = async ({ to, subject, html }) => {
	await transporter.sendMail({
		from: '"DEV Inertia" <smmr.career@gmail.com>',
		to,
		subject,
		html, // html body template body here
	});
};

export { isEmailValid, validateEmailWithMx, sendMail };
