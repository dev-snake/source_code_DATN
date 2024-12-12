const StaffService = require("@/services/StaffService");
const BranchService = require("@/services/BranchService")
const { log } = require("debug");
const MapResponseMessage = require("@/utils/response-message/vi-VN");

class StaffController {
	constructor() {
	}

	async getAllStaff(req, res, next) {
		try {
			const {
				page,
				limit,
				noPagination,
				paginatedData,
				totalPages,
				totalRecords
			} = await StaffService.getAllStaffWithPagination(req.query)

			if (!noPagination) {
				if (page > totalPages) {
					return next({
						status: 400,
						message: MapResponseMessage.notExistPage(totalPages)
					})
				}
			}


			return res.status(200).json({
				status: "success",
				message: paginatedData.length > 0
					? noPagination
						? MapResponseMessage.successGetAllWithoutPagination("Nhân viên")
						: MapResponseMessage.successGetAllWithPagination("Nhân viên")
					: MapResponseMessage.successWithEmptyData("Nhân viên"),
				metadata: {
					currentPage: noPagination ? 1 : page,
					limitPerPage: noPagination ? null : limit,
					totalPages: noPagination ? 1 : totalPages,
					totalRecords,
					countRecords: paginatedData.length
				},
				results: paginatedData
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			});
		}
	}

	async getStaffInfo(req, res, next) {
		try {
			const { staffId } = req.params;

			const { parseBranch } = req.query;

			const staffInfo = await StaffService.getStaffInfoById(staffId, ["branchRef"])

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successGetOne("Nhân viên"),
				metadata: {
					staffId,
					staffCode: staffInfo.staffCode,
					staffName: staffInfo.staffName,
				},
				results: !parseBranch ? staffInfo : {
					...staffInfo,
					branchRef: await BranchService.getBranchDisplayName(staff.branchRef)
				}
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async changeRole(req, res, next) {
		try {
			const { staffId } = req.params;

			const { newRole } = req.body;

			await StaffService.changeRole(staffId, newRole);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successUpdate("Chức danh của nhân viên"),
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async jobQuit(req, res, next) {
		try {
			const { staffId } = req.params;

			await StaffService.jobQuit(staffId);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.staffQuitJob,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async activeAccount(req, res, next) {
		try {
			const { staffId } = req.params;

			await StaffService.activeAccount(staffId);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.reActiveStaffAccount,
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}

	async changeBranch(req, res, next) {
		try {

			const { staffId } = req.params;

			const { newBranchRef } = req.body;

			await StaffService.changeBranch(staffId, newBranchRef);

			return res.status(200).json({
				status: "success",
				message: MapResponseMessage.successUpdate("Chi nhánh làm việc của nhân viên"),
			});
		} catch (error) {
			return next({
				status: 500,
				error,
			})
		}
	}
}

module.exports = new StaffController();