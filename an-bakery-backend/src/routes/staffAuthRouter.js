const express = require('express')
const router = express.Router()

const StaffAuthController = require('@/controllers/StaffAuthController')
const {
  customerTokenMiddleware,
  refreshTokenMiddleware,
  staffTokenMiddleware,
} = require('@/middlewares/token-middlewares')
const { validateRequiredParams } = require('@/middlewares/required-params')
const { requiredRole } = require('@/middlewares/role-validate')

router.post(
  '/new',
  validateRequiredParams(['staffCode', 'password', 'staffName', 'role']),
  staffTokenMiddleware,
  requiredRole(1),
  StaffAuthController.createNewStaff
)
router.post(
  '/sign-in',
  validateRequiredParams(['staffCode', 'password']),
  StaffAuthController.signIn
)
router.post('/sign-out', staffTokenMiddleware, StaffAuthController.signOut)
router.get('/rftk', refreshTokenMiddleware, StaffAuthController.refreshToken)

module.exports = router
