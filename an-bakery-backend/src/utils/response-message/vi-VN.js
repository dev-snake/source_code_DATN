const MapResponseMessage = {
	invalidRefreshToken: 'Invalid refreshToken',
	invalidAccessToken: 'Invalid accessToken',
	successGetNewAccessToken: 'Successfully get new accessToken',
	notFoundEmail: 'Không tìm thấy tài khoản nào với email mà bạn cung cấp',
	successSignOut: 'Đăng xuất thành công',
	successSignIn: 'Đăng nhập thành công',
	successSignUp: 'Đăng ký tài khoản thành công',
	accountBlocked: 'Tài khoản này đã bị khóa',
	blockCustomer: 'Khóa tài khoản khách hàng thành công',
	unBlockCustomer: 'Mở khóa tài khoản khách hàng thành công',
	wrongProvider:
		'Có vẻ bạn đã chọn sai phương thức đăng nhập của tài khoản, vui lòng thử lại',
	wrongPassword: 'Sai mật khẩu',
	wrongOldPassword: 'Sai mật khẩu cũ',
	emailUsed: 'Email này đã được sử dụng',
	notSignIn: 'Tài khoản này không có lịch sử đăng nhập',
	sentRecoverCode: 'Đã gửi mã khôi phục tài khoản',
	wrongOTP: 'OTP không đúng',
	successRecoverAccount:
		'Khôi phục tài khoản thành công, mật khẩu mới đã được gửi tới email của bạn',
	notExistPage: (totalPages = null) =>
		`Trang không tồn tại, dữ liệu bạn yêu cầu chỉ có ${totalPages ?? 1} trang`,
	successGetAllWithPagination: (dataName, currentPage = 1) =>
		`Lấy thành công tất cả ${dataName} trong trang ${currentPage}`,
	successGetAllWithoutPagination: (dataName) =>
		`Lấy thành công tất cả ${dataName}`,
	successWithEmptyData: (dataName) =>
		`Truy vấn thành công nhưng không tìm thấy bất kì ${dataName} nào`,
	successGetOne: (dataName) =>
		`Lấy thành công dữ liệu chi tiết của ${dataName}`,
	notEnoughPermission: 'Bạn không có quyền thực hiện hành động này',
	requireHigherPermission: 'Bạn cần quyền cao hơn để thực hiện hành động này',
	requireMinLength: (field, minLength) =>
		`${field} phải có ít nhất ${minLength} ký tự`,
	requireStartWith: (field, startWith) =>
		`${field} phải bắt đầu bằng '${startWith}'`,
	successCreate: (dataName) => `Tạo ${dataName} thành công`,
	successUpdate: (dataName) => `Cập nhật ${dataName} thành công`,
	failureUpdate: (dataName) => `Cập nhật ${dataName} thất bại`,
	successCancel: (dataName) => `Hủy ${dataName} thành công`,
	successRecover: (dataName) => `Khôi phục ${dataName} thành công`,
	successDeleted: (dataName) => `Xóa ${dataName} thành công`,
	hasCancelled: (dataName) => `${dataName} đã bị hủy`,
	notFound: (dataName) => `Không tìm thấy ${dataName}`,
	exists: (dataName, extraString = "") => `${dataName} đã tồn tại ${extraString}`,
	invalidRequestStatus: 'Trạng thái mà bạn muốn cập nhật không hợp lệ',
	orderNotCompleted: 'Đơn hàng chưa hoàn thành',
	addNewItemToCart: `Thêm bánh vào giỏ hàng thành công`,
	resetCart: `Đặt lại giỏ hàng thành công`,
	existCategoryKey: `Đã có danh mục sử dụng categoryKey này`,
	invalidCategoryKey: `categoryKey không hợp lệ`,
	returnedOrder: `Cập nhật trạng thái trả đơn hàng thành công`,
	rejectedOrder: `Từ chối đơn hàng thành công`,
	invalidCurrentOrderStatus: `Trạng thái hiện tại của đơn hàng không hợp lệ`,
	invalidProvidedOrderStatus: `Trạng thái đơn hàng bạn cung cấp không hợp lệ`,
	staffQuitJob: `Chuyển trạng thái nghỉ việc thành công`,
	reActiveStaffAccount: 'Kích hoạt lại tài khoản của nhân viên thành công',
	successUseVoucher: 'Sử dụng mã giảm giá thành công',
	failureUseVoucher: 'Sử dụng mã giảm giá thất bại',
	invalidVoucherStartTime:
		'Thời gian bắt đầu hiệu lực phải nhỏ hơn thời gian hết hạn mã',
	invalidMaxTotalUsage:
		'Tổng lượt sử dụng tối đa của mã phải lớn hơn Tổng lượt sử dụng tối đa của khách hàng',
	invalidBranchVoucher:
		'Mã giảm giá bạn sử dụng không phải là mã giảm giá của chi nhánh',
	invalidVoucherUsageTime: 'Mã chưa đến thời gian sử dụng, hoặc đã hết hạn',
	invalidMinimumOrderValue:
		'Tổng giá trị đơn hàng chưa đạt yêu cầu giá trị tối thiểu của mã',
	outOfTotalUses: 'Mã này đã đạt số lượt sử dụng tối đa',
	outOfCustomerUses: 'Bạn đã hết lượt sử dụng mã này',
	notInWhitelist:
		'Bạn không nằm trong danh sách khách hàng được sử dụng mã này',
	conflictMessage: (dataName) => `${dataName} có dữ liệu`,
	hasRelatedData: (dataName) => `Bạn không thể xóa ${dataName} do có liên quan đến các dữ liệu khác`,
	// blockSoftDeleteCategory: `Không thể xóa danh mục vì còn `,
	notInSoftDeletionState: (action) => action === "recover" ? `Không thể khôi phục vì không ở trạng thái đã xóa` : `Không thể thực hiện hành động xóa vĩnh viễn vì không ở trạng thái đã xóa`,
	alreadyDeleted: (dataName) => `${dataName} đã ở trạng thái xóa, bạn không thể thực hiện thao tác này lần nữa`,
	hasNotCompletedRequest: (dataName) => `Không thể xóa ${dataName} vì còn yêu cầu nhập hàng chưa hoàn thành`,
	notEnoughWeight: `Số lượng xóa không được lớn hơn số lượng tồn trong kho`,
	successRemoveExpired: (dataName) => `Huỷ ${dataName} hết hạn thành công`,
	hasRecipeUsingMaterial: `Không thể xóa nguyên liệu này vì có công thức sử dụng nó`,
	hasUnFinishedImportRequestRelated: `Không thể xóa nguyên liệu này vì có yêu cầu nhập hàng chưa hoàn thành liên quan đến nguyên liệu này`,
}

module.exports = MapResponseMessage
