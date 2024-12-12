function validateRequiredParams(requiredParams) {
	return function (req, res, next) {
		const missingParams = requiredParams.filter((param) => req.body[param] === undefined);

		if (missingParams.length > 0) {
			return res.status(400).json({
				status: "error",
				message: `Missing required parameter(s): ${missingParams.join(", ")}`,
			});
		}

		next();
	};
}

module.exports = { validateRequiredParams };
