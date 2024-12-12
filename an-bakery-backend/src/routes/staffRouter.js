const express = require("express");
const router = express.Router();

const StaffController = require("@/controllers/StaffController");

const { customerTokenMiddleware, staffTokenMiddleware } = require("@/middlewares/token-middlewares");
const { validateRequiredParams } = require("@/middlewares/required-params");
const { requiredRole } = require("@/middlewares/role-validate");
const { validateForbiddenParams } = require("@/middlewares/forbidden-params");

router.get("/", StaffController.getAllStaff);
router.get("/:staffId", StaffController.getStaffInfo);
router.post("/:staffId/role", validateRequiredParams(["newRole"]), staffTokenMiddleware, requiredRole(2), StaffController.changeRole);
router.delete("/:staffId/quit", staffTokenMiddleware, requiredRole(1), StaffController.jobQuit);
router.patch("/:staffId/active", staffTokenMiddleware, requiredRole(1), StaffController.activeAccount)
router.patch("/:staffId/change-branch", validateRequiredParams(["newBranchRef"]), staffTokenMiddleware, requiredRole(2), StaffController.changeBranch)

module.exports = router;
