const express = require('express')
const router = express.Router();


router.post("/create-url", function (req, res, next) {
	try {
		const moment = require('moment');

		process.env.TZ = 'Asia/Ho_Chi_Minh';

		let date = new Date();
		let createDate = moment(date).format('YYYYMMDDHHmmss');

		let ipAddr = req.headers['x-forwarded-for'] ||
			req.socket.remoteAddress


		let tmnCode = "J1K4T8P9"
		let secretKey = "CGEY5BH82TBMN4S4LNFLY9YXEW2QQAT1";
		let vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
		let returnUrl = "http://localhost:5173/order/vnpay_return";
		const { amount, bankCode, orderId } = req.body;

		let locale = "vn"
		let currCode = 'VND';
		let vnp_Params = {};
		vnp_Params['vnp_Version'] = '2.1.0';
		vnp_Params['vnp_Command'] = 'pay';
		vnp_Params['vnp_TmnCode'] = tmnCode;
		vnp_Params['vnp_Locale'] = locale;
		vnp_Params['vnp_CurrCode'] = currCode;
		vnp_Params['vnp_TxnRef'] = orderId;
		vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD: #' + orderId;
		vnp_Params['vnp_OrderType'] = 'other';
		vnp_Params['vnp_Amount'] = amount * 100;
		vnp_Params['vnp_ReturnUrl'] = returnUrl;
		vnp_Params['vnp_IpAddr'] = ipAddr;
		vnp_Params['vnp_CreateDate'] = createDate;
		if (bankCode !== null && bankCode !== '') {
			vnp_Params['vnp_BankCode'] = bankCode;
		}

		vnp_Params = sortObject(vnp_Params);

		const querystring = require('qs');
		let signData = querystring.stringify(vnp_Params, { encode: false });

		const crypto = require("crypto");
		let hmac = crypto.createHmac("sha512", secretKey);
		let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");
		console.log(signed);
		vnp_Params['vnp_SecureHash'] = signed;
		vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

		return res.status(200).json({
			status: "success",
			message: "Tạo URL Thanh toán thành công",
			results: vnpUrl
		})
	} catch (error) {
		console.log(error)
		return next({
			status: 500,
			error,
		})
	}
})

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			str.push(encodeURIComponent(key));
		}
	}
	str.sort();
	for (key = 0; key < str.length; key++) {
		sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
	}
	return sorted;
}

module.exports = router