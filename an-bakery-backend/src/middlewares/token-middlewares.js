const { decodeToken } = require('@/utils/jwt-token')

function customerTokenMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized - Access token not found',
      })
    }

    try {
      const { _id, email } = decodeToken(token)

      req._id = _id
      req.email = email

      next()
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token is expired',
        })
      }
      return res.status(500).json({
        status: 'error',
        message: err.message,
      })
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    })
  }
}

function staffTokenMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    console.log(token)
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized - Access token not found',
      })
    }

    try {
      const { _id, staffCode, branchRef, role } = decodeToken(token)

      if (!staffCode) {
        return res.status(403).json({
          status: 'error',
          message: 'Invalid token, you do not have access to this resource',
        })
      }

      req._id = _id
      req.staffCode = staffCode
      req.branchRef = branchRef
      req.role = role

      next()
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token is expired',
        })
      }
      return res.status(500).json({
        status: 'error',
        message: err.message,
      })
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    })
  }
}

function refreshTokenMiddleware(req, res, next) {
  try {
    const refreshToken = req.headers['x-rftk']

    if (!refreshToken) {
      return res.status(404).json({
        status: 'failure',
        message: 'No token provided',
      })
    }

    try {
      const { _id, isRefreshToken } = decodeToken(refreshToken)

      if (!isRefreshToken) {
        return res.status(404).json({
          status: 'error',
          message: 'Invalid token - This is not a refreshToken',
        })
      }

      req._id = _id
      req.refreshToken = refreshToken
      next()
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          status: 'error',
          message: 'Token is expired',
        })
      }
      return res.status(500).json({
        status: 'error',
        message: err.message,
      })
    }
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    })
  }
}

module.exports = {
  customerTokenMiddleware,
  refreshTokenMiddleware,
  staffTokenMiddleware,
}
