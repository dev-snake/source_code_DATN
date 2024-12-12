const express = require('express')
const router = express.Router()

const AnalyticsController = require('@/controllers/AnalyticsController')


router.get("/orders", AnalyticsController.getAllOrderAnalytics)
router.get("/orders/daily-orders-in-month", AnalyticsController.getAnalysisDailyOrdersInMonth)
router.get("/orders/orders-in-year", AnalyticsController.getOrdersInYear)
// router.get("/orders/orders-in-year", AnalyticsController.getOrdersInYear)

router.get("/customers/customers-in-year", AnalyticsController.getNewCustomersInYear)
router.get("/customers/daily-customers-in-month", AnalyticsController.getDailyNewCustomersInMonth)
router.get("/", AnalyticsController.getAnalytics)

module.exports = router;