const OrderModel = require('@/models/OrderModel');
const BranchModel = require('@/models/BranchModel');

const CustomerModel = require("@/models/CustomerModel")
const listMonths = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];


class AnalyticsService {

	async analysisOrderInYear(orderStatus = undefined) {
		return Promise.all(listMonths.map(async (month, index) => {
			const startDate = new Date(new Date().getFullYear(), index, 1);
			const endDate = new Date(new Date().getFullYear(), index + 1, 0);

			const filter = {
				createdAt: {
					$gte: startDate,
					$lt: endDate
				}
			};

			if (orderStatus) {
				filter.orderStatus = orderStatus;
			}

			const orders = await OrderModel.find(filter).lean();

			return {
				month: listMonths[index],
				value: orders.length
			};
		}));
	}

	async analysisOrderInMonth(monthIndex, orderStatus = undefined) {
		console.log(monthIndex)
		const startDate = new Date(new Date().getFullYear(), monthIndex, 1);
		const endDate = new Date(new Date().getFullYear(), monthIndex + 1, 0);

		const filter = {
			createdAt: {
				$gte: startDate,
				$lt: endDate
			}
		};

		if (orderStatus) {
			filter.orderStatus = orderStatus;
		}

		const orders = await OrderModel.find(filter).lean();

		const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
		const dailyOrders = Array.from({ length: daysInMonth }, () => 0);

		orders.forEach(order => {
			const day = new Date(order.createdAt).getDate();
			dailyOrders[day - 1]++;
		});

		return dailyOrders.map((value, index) => ({
			day: index + 1,
			value
		}));
	}

	async analysisOrderByBranch(monthIndex, orderStatus = undefined) {
		const startDate = new Date(new Date().getFullYear(), monthIndex, 1);
		const endDate = new Date(new Date().getFullYear(), monthIndex + 1, 0);

		const filter = {
			createdAt: {
				$gte: startDate,
				$lt: endDate
			}
		};

		if (orderStatus) {
			filter.orderStatus = orderStatus;
		}

		const orders = await OrderModel.find(filter).lean();

		const branchOrders = (await BranchModel.find().lean()).map((branch) => ({
			branch,
			orders: 0
		}));

		orders.forEach((order) => {
			const branchOrder = branchOrders.find(
				(_b) => _b.branch._id.toString() === order.branchId.toString()
			);
			if (branchOrder) {
				branchOrder.orders += 1;
			}
		});

		return branchOrders;
	}


	async analysisCustomersInYear() {
		return Promise.all(listMonths.map(async (month, index) => {
			const startDate = new Date(new Date().getFullYear(), index, 1);
			const endDate = new Date(new Date().getFullYear(), index + 1, 0);

			const customers = await CustomerModel.find({
				createdAt: {
					$gte: startDate,
					$lt: endDate
				}
			}).lean();

			return {
				month: listMonths[index],
				value: customers.length
			};
		}));
	}

	async analysisCustomersInMonth(monthIndex) {
		const startDate = new Date(new Date().getFullYear(), monthIndex, 1);
		const endDate = new Date(new Date().getFullYear(), monthIndex + 1, 0);

		const customers = await CustomerModel.find({
			createdAt: {
				$gte: startDate,
				$lt: endDate
			}
		}).lean();

		const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
		const dailyCustomers = Array.from({ length: daysInMonth }, () => 0);

		customers.forEach(order => {
			const day = new Date(order.createdAt).getDate();
			dailyCustomers[day - 1]++;
		});

		return dailyCustomers.map((value, index) => ({
			day: index + 1,
			value
		}));
	}

	async analysisRevenueInMonth(monthIndex, isActual) {

		const startDate = new Date(new Date().getFullYear(), monthIndex, 1);
		const endDate = new Date(new Date().getFullYear(), monthIndex + 1, 0);

		const filter = {
			createdAt: {
				$gte: startDate,
				$lt: endDate
			},
			orderType: "customerOrder"
		}

		if (isActual) {
			filter.orderStatus = "completed";
		}

		console.log(filter)

		const orders = await OrderModel.find(filter).lean();

		// console.log(orders)

		const daysInMonth = new Date(new Date().getFullYear(), monthIndex + 1, 0).getDate();
		const dailyRevenue = Array.from({ length: daysInMonth }, () => ({
			orders: 0,
			revenues: 0,
		}));

		orders.forEach(order => {
			const day = new Date(order.createdAt).getDate();
			dailyRevenue[day - 1].orders++;
			dailyRevenue[day - 1].revenues += order.orderSummary.totalPrice;
		});

		return dailyRevenue.map((value, index) => ({
			day: index + 1,
			orders: value.orders,
			revenues: value.revenues
		}));
	}


	async analysisTotalRevenueInYear(isActual) {
		return Promise.all(listMonths.map(async (month, index) => {
			const startDate = new Date(new Date().getFullYear(), index, 1);
			const endDate = new Date(new Date().getFullYear(), index + 1, 0);

			const filter = {
				createdAt: {
					$gte: startDate,
					$lt: endDate
				}
			}

			if (isActual) {
				filter.orderStatus === "completed";
			}


			const monthRevenue = {
				orders: 0,
				revenues: 0,
			}

			const orders = await OrderModel.find(filter).lean();


			orders.forEach(order => {
				const month = new Date(order.createdAt).getMonth();
				if (month !== index) {
					return;
				}
				monthRevenue.orders++;
				monthRevenue.revenues += order.orderSummary.totalPrice;
			});

			return {
				month: index + 1,
				...monthRevenue
			}
		}));
	}


}

module.exports = new AnalyticsService();