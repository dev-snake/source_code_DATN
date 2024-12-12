const CakeModel = require('@/models/CakeModel');
const CakeService = require("@/services/CakeService");

class RateService {
	constructor() {

	}

	async createNewRate(cakeId, customerId, rateData) {
		const { rateContent, rateStars } = rateData;

		return CakeModel.findByIdAndUpdate(cakeId, {
			$push: {
				rates: {
					customerId,
					rateContent,
					rateStars
				},
			}
		}, { new: true })
	}

	async hideRate(cakeId, rateId, isHide) {
		const { rates } = await CakeService.getCakeInfoById(cakeId);

		const newRate = rates.map((rate) => {
			if (rateId === rate._id.toString()) {
				rate.isHide = isHide
			}
			return rate
		});

		return CakeModel.findByIdAndUpdate(cakeId, {
			rates: newRate
		}, { new: true })
	}

	async softDeleteRate(cakeId, rateId, isDeleted) {
		const { rates } = await CakeService.getCakeInfoById(cakeId);

		const newRate = rates.map((rate) => {
			if (rateId === rate._id.toString()) {
				rate.isDeleted = isDeleted
			}
			return rate
		});

		return CakeModel.findByIdAndUpdate(cakeId, {
			rates: newRate
		}, { new: true })
	}

	async forceDeleteRate(cakeId, rateId) {
		const { rates } = await CakeService.getCakeInfoById(cakeId);

		const newRate = rates.filter((_v) => _v._id.toString() !== rateId);

		return CakeModel.findByIdAndUpdate(cakeId, {
			rates: newRate
		})
	}

}

module.exports = new RateService();