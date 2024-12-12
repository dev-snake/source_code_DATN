const CustomerModel = require('@/models/CustomerModel')
const AuthService = require('@/services/AuthService')

const pagination = require('@/utils/pagination')
const {
  generateRefreshToken,
  generateCustomerAccessToken,
} = require('@/utils/jwt-token')

class CustomerService {
  constructor() {}

  async checkValidCustomerId(customerId) {
    return !!(await CustomerModel.findById(customerId))
  }

  async checkExistEmail(email) {
    const existingEmail = await CustomerModel.find({
      email,
    })
    return existingEmail.length > 0
  }

  async getCustomerInfoById(customerId) {
    return CustomerModel.findById(customerId).lean()
  }

  async getCustomerInfoByEmail(email) {
    return CustomerModel.findOne({
      email,
    }).lean()
  }

  async getAllCustomerWithPagination(queryParams) {
    return pagination(CustomerModel, queryParams)
  }

  async setNewPassword(customerId, newPassword) {
    return CustomerModel.findByIdAndUpdate(
      customerId,
      {
        password: await AuthService.generateHashedPassword(newPassword),
      },
      {
        new: true,
      }
    )
  }

  async generateToken(customerInfo) {
    const refreshToken = generateRefreshToken(customerInfo)
    const accessToken = generateCustomerAccessToken(customerInfo)

    await CustomerModel.findOneAndUpdate(
      {
        email: customerInfo.email,
      },
      {
        refreshToken,
      }
    )

    return { refreshToken, accessToken }
  }

  async removeToken(customerId) {
    return CustomerModel.findByIdAndUpdate(customerId, {
      refreshToken: null,
    })
  }

  async createNewAccount(authData) {
    const { email, password, provider } = authData

    const hashedPassword = await AuthService.generateHashedPassword(password)

    return CustomerModel.create({
      email,
      password: provider === 'credentials' ? hashedPassword : null,
      provider,
    })
  }

  async checkIsLoggedIn(customerId) {
    const customerInfo = await CustomerModel.findById(customerId)

    return !!customerInfo?.refreshToken
  }

  async handleBlockCustomer(customerId, blockReason) {
    return CustomerModel.findByIdAndUpdate(customerId, {
      isActive: false,
      $push: {
        blockHistory: {
          blockTime: new Date(),
          blockReason,
        },
      },
    })
  }

  async handleUnblock(customerId) {
    return CustomerModel.findByIdAndUpdate(customerId, {
      isActive: true,
    })
  }

  async calculatePoint(orderId, operation, customerId, points, type, session) {
    const validType = ['order', 'give', 'confirmed']
    const validOperations = ['add', 'sub']

    if (!validType.includes(type)) {
      return {
        isCompleted: false,
        message: 'Invalid type',
      }
    }

    if (!validOperations.includes(operation)) {
      return {
        isCompleted: false,
        message: 'Invalid operation',
      }
    }

    const mapTitle = {
      order: 'Hoàn thành đơn hàng',
      confirmed: 'Hoàn thành đặt hàng',
      give: 'Quà tặng',
    }

    const updateOptions = session ? { session } : {}

    await CustomerModel.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          'vipPoints.currentPoint': operation === 'add' ? points : -points,
        },
        $push: {
          'vipPoints.historyPoints': {
            amount: operation === 'add' ? points : -points,
            title: `${mapTitle[type]} - ${orderId}`,
          },
        },
      },
      updateOptions
    )

    return {
      isCompleted: true,
      message: `Successfully ${
        operation === 'add' ? 'added to' : 'subtracted from'
      } the points for ${mapTitle[type]}.`,
    }
  }

  async minusPoint(customerId, points, type) {
    const validType = ['order', 'give']

    if (!validType.includes(type)) {
      return {
        isCompleted: false,
        message: 'Invalid type',
      }
    }

    const mapTitle = {
      order: 'Thanh toán đơn hàng',
      give: 'Đổi quà tặng',
    }
    await CustomerModel.findByIdAndUpdate(customerId, {
      $inc: {
        currentPoint: -points,
      },
      $push: {
        historyPoints: {
          amount: -points,
          title: mapTitle[type],
        },
      },
    })

    return {
      isCompleted: true,
      message: 'Successfully added points',
    }
  }

  async updateCustomerInfo(customerId, updateData) {
    return CustomerModel.findByIdAndUpdate(customerId, updateData, {
      new: true,
    })
  }
}

module.exports = new CustomerService()
