const CustomerModel = require('@/models/CustomerModel');

class AddressService {
	async createNewAddress(
		customerId,
		{ fullName, email, phoneNumber, fullAddress, provinceId, districtId, wardId }
	) {
		return CustomerModel.findByIdAndUpdate(
			customerId,
			{
				$push: {
					userAddresses: {
						fullName,
						email,
						phoneNumber,
						fullAddress,
						provinceId,
						districtId,
						wardId
					}
				}
			},
			{ new: true }
		);
	}

	async getCustomerAddresses(customerId) {
		const { userAddresses } = await CustomerModel.findById(customerId).lean();
		return userAddresses;
	}

	async getAddressInfo(customerId, addressId) {
		const listCustomerAddresses = await this.getCustomerAddresses(customerId);

		return (
			listCustomerAddresses.find((address) => address._id.toString() === addressId) ?? null
		);
	}

	async deleteAddress(customerId, addressId) {
		const listCustomerAddresses = await this.getCustomerAddresses(customerId);

		const newListCustomerAddresses = listCustomerAddresses.filter(
			(address) => address._id.toString() !== addressId
		);

		return CustomerModel.findByIdAndUpdate(
			customerId,
			{
				userAddresses: newListCustomerAddresses
			},
			{ new: true }
		);
	}

	async updateAddress(customerId, addressId, updateData) {
		const listCustomerAddresses = await this.getCustomerAddresses(customerId);

		const newListCustomerAddresses = listCustomerAddresses.map((address) => {
			if (address._id.toString() === addressId) {
				return {
					...address,
					...updateData
				};
			}
			return address;
		});

		return CustomerModel.findByIdAndUpdate(
			customerId,
			{
				userAddresses: newListCustomerAddresses
			},
			{ new: true }
		);
	}
}

module.exports = new AddressService();
