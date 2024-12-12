function validateForbiddenParams(forbiddenParams) {
  return function (req, res, next) {
    const checker = forbiddenParams.filter((param) => req.body[param]);

    if (checker.length > 0) {
      return res.status(400).json({
        status: "error",
        message: `You can't send forbidden parameters:: ${checker.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = { validateForbiddenParams };
