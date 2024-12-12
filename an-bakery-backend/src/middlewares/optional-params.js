function validateOptionalParams(optionalParams) {
  return function (req, res, next) {
    const listParams = optionalParams.some((param) => !!req.body[param]);

    if (!listParams) {
      return res.status(400).json({
        status: "error",
        message: `At least one of the following parameters is required: ${optionalParams.join(
          ", "
        )}`,
      });
    }

    next();
  };
}

module.exports = { validateOptionalParams };
