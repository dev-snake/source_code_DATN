function requiredRole(requiredRoleLevel) {
	return function (req, res, next) {
		if (req.role < requiredRoleLevel) {
			return res.status(400).json({
				status: "failure",
				message: "You don't have permission to perform this.",
			});
		}
		next();
	};
}

module.exports = { requiredRole };
