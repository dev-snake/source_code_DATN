const AnalyticsService = require('../services/AnalyticsService');

class AnalyticsController {

	async getAllOrderAnalytics(req, res, next) {
		return res.status(200).json({
			results: await AnalyticsService.analysisRevenueInMonth(new Date().getMonth(), false)
		})
	}

	async getAnalysisDailyOrdersInMonth(req, res, next) {
		try {

			const { month } = req.query;

			const thisMonth = new Date().getMonth();

			console.log(thisMonth);

			const allStatusData = await AnalyticsService.analysisOrderInMonth(month ? month - 1 : thisMonth);
			const completeStatusData = await AnalyticsService.analysisOrderInMonth(month ? month - 1 : thisMonth, "completed");
			const failureStatusData = await AnalyticsService.analysisOrderInMonth(month ? month - 1 : thisMonth, {
				$in: ["rejected",
					"cancelled",
					"returned",]
			});

			const provisionalRevenueData = await AnalyticsService.analysisRevenueInMonth(month ? month - 1 : thisMonth, false);
			const actualRevenueData = await AnalyticsService.analysisRevenueInMonth(month ? month - 1 : thisMonth, true);

			return res.status(200).json({
				status: "success",
				message: "",
				results: {
					allStatusData,
					completeStatusData,
					failureStatusData,
					provisionalRevenueData,
					actualRevenueData
				}
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getOrdersInYear(req, res, next) {
		try {

			const { year } = req.query;

			const thisYear = new Date().getFullYear();

			const allStatusData = await AnalyticsService.analysisOrderInYear();
			const completeStatusData = await AnalyticsService.analysisOrderInYear("completed");
			const failureStatusData = await AnalyticsService.analysisOrderInYear({
				$in: ["rejected",
					"cancelled",
					"returned",]
			});

			return res.status(200).json({
				status: "success",
				message: "",
				results: {
					allStatusData,
					completeStatusData,
					failureStatusData,
				}
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getNewCustomersInYear(req, res, next) {
		try {

			const { year } = req.query;

			const thisYear = new Date().getFullYear();

			const allCustomersData = await AnalyticsService.analysisCustomersInYear();

			return res.status(200).json({
				status: "success",
				message: "",
				results: {
					allCustomersData
				}
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getDailyNewCustomersInMonth(req, res, next) {
		try {

			const { month } = req.query;

			const thisMonth = new Date().getMonth();


			const allCustomersData = await AnalyticsService.analysisCustomersInMonth(month ? month - 1 : thisMonth);

			return res.status(200).json({
				status: "success",
				message: "",
				results: {
					allCustomersData,
				}
			})
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async getAnalytics(req, res, next) {
		try {

			const currentMonth = new Date().getMonth() + 1;
			const currentDate = new Date().getDate();
			const orderInYear = (await AnalyticsService.analysisOrderInYear()).splice(0, currentMonth);
			const revenueInYear = (await AnalyticsService.analysisTotalRevenueInYear()).splice(0, currentMonth);
			const customerInYear = (await AnalyticsService.analysisCustomersInYear()).splice(0, currentMonth);
			const orderInMonth = (await AnalyticsService.analysisOrderInMonth(currentMonth - 1))
			const branchOrders = await AnalyticsService.analysisOrderByBranch(currentMonth - 1);

			return res.status(200).json({
				status: "success",
				message: "",
				results: {
					orderInYear,
					revenueInYear,
					customerInYear,
					orderInMonth,
					branchOrders

				}
			})

		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
}

module.exports = new AnalyticsController();