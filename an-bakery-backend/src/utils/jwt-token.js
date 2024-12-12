const jwt = require('jsonwebtoken')

const generateCustomerAccessToken = (customerData) => {
  const { _id, email } = customerData

  const payload = { _id, email }

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '10m' })
}

const generateStaffAccessToken = (staffData) => {
  const { _id, staffCode, branchRef, role } = staffData

  const payload = { _id, staffCode, branchRef, role }

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })
}

const generateRefreshToken = (profileData) => {
  const { _id } = profileData
  const payload = { _id, isRefreshToken: true }

  return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '30d' })
}

const decodeToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET_KEY)
}

module.exports = {
  decodeToken,
  generateRefreshToken,
  generateCustomerAccessToken,
  generateStaffAccessToken,
}
