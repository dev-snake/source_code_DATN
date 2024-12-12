const CustomerModel = require("@/models/CustomerModel");
const { generateRefreshToken, generateCustomerAccessToken } = require("@/utils/jwt-token");
const bcrypt = require("bcrypt");
const { randomString } = require("@/utils/random-string");

class AuthService {

	constructor() {
		
	}


	compareProvider(currentProvider, serverProvider) {
		return currentProvider === serverProvider;
	}

	compareRefreshToken(currentRefreshToken, serverRefreshToken) {
		return currentRefreshToken === serverRefreshToken;
	}


	async generateHashedPassword(password) {
		return bcrypt.hash(password, 10);
	}

	async comparePassword(providedPassword, serverPassword) {
		return await bcrypt.compare(providedPassword, serverPassword);
	}


	async generateNewPassword() {
		return randomString()
	}
}

module.exports = new AuthService();