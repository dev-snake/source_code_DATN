const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const changePasswordTemplate = require("@/utils/email-template/change-pwd");

const OTPModel = require("@/models/OTPModel");
const CustomerModel = require("@/models/CustomerModel");

const OTPService = require("@/services/OTPService");
const recoverAccountTemplate = require("@/utils/email-template/recover-account");
const successfullyRecoverTemplate = require("@/utils/email-template/successfully-recover");

class EmailService {
	constructor() {
		this.sendMailChangePassword = this.sendMailChangePassword.bind(this);
		this.sendMailRecoverAccount = this.sendMailRecoverAccount.bind(this);
	}

	async createTransporter() {
		try {
			const oauth2Client = new OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

			oauth2Client.setCredentials({
				refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
			});

			const accessToken = await oauth2Client.getAccessToken();

			return nodemailer.createTransport({
				service: "gmail",
				auth: {
					type: "OAuth2",
					user: process.env.USER_EMAIL,
					clientId: process.env.GOOGLE_CLIENT_ID,
					refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
					accessToken: accessToken.token,
				},
			});
		} catch (err) {
			return err;
		}
	}

	async sendMailChangePassword(req, res, next) {
		try {
			const otpCode = await OTPService.createNewOTP(req._id, "password");

			let emailTransporter = await this.createTransporter();

			const mailOptions = {
				from: process.env.USER_EMAIL,
				to: req.email,
				subject: "Have you requested to change your password?",
				html: changePasswordTemplate(otpCode),
			};

			await emailTransporter.sendMail(mailOptions);

			return res.status(200).json({
				status: "success",
				message: "Successfully sent email",
			});
		} catch (error) {
			next({
				status: 500,
				error,
			});
		}
	}

	async sendMailRecoverAccount(customerId, email) {
		try {
			let emailTransporter = await this.createTransporter();
			console.log(emailTransporter)

			const otpCode = await OTPService.createNewOTP(customerId, "recover");

			const mailOptions = {
				from: process.env.USER_EMAIL,
				to: email,
				subject: "Have you requested to recover your account?",
				html: recoverAccountTemplate(otpCode),
			};

			await emailTransporter.sendMail(mailOptions);

			return true;
		} catch (error) {
			throw new Error(error);
		}
	}

	async sendNewPassword(email, newPassword) {
		try {
			let emailTransporter = await this.createTransporter();

			const mailOptions = {
				from: process.env.USER_EMAIL,
				to: email,
				subject: "Account Recovery Successful",
				html: successfullyRecoverTemplate(newPassword),
			};

			await emailTransporter.sendMail(mailOptions);

			return true;
		} catch (error) {
			throw new Error(error);
		}
	}
}

module.exports = new EmailService();
