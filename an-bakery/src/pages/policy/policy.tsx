import BannerPolicy from "@/assets/images/policy.png";
import iconConfig from "@/config/icons/icon-config";
import { Image } from "@nextui-org/react";
import anbakery from "@/assets/images/logo.png";
const Poh6cy = () => {
  return (
    <section className="w-full">
      <Image src={BannerPolicy} alt="Error" radius="none" />
      <div className="mx-auto mt-16 grid max-w-7xl gap-4 max-lg:px-4 lg:grid-cols-12">
        <div className="rounded-lg border p-8 max-lg:order-2 max-lg:w-full lg:order-1 lg:col-span-3">
          <div className="flex flex-col gap-y-4">
            <div className="flex w-full items-center gap-2 text-primary max-lg:border-b-1 max-lg:py-2">
              {iconConfig.file.medium}
              <h6 className="truncate"> Chính sách cửa hàng</h6>
            </div>
            {/* <div className="flex w-full items-center gap-2 text-default hover:cursor-pointer max-lg:border-b-1 max-lg:py-2">
              {iconConfig.file.medium}
              <h6 className="truncate"> Chính sách mua hàng</h6>
            </div> */}
          </div>
          <div className=""></div>
        </div>
        {/*  */}
        {/* <div className="w-full rounded-lg border p-4 max-lg:order-1 lg:order-2 lg:col-span-9">
          <h3>Chính sách bảo mật và điều khoản - AnBakery</h3>
          <div className="mt-4 flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <h5>1- Mục đích và phạm vi thu thập thông tin</h5>
              <div className="flex flex-col gap-x-2 gap-y-2">
                <p>
                  - An Barkery không bán, chia sẻ hay trao đổi thông tin cá nhân của khách hàng thu thập trên
                  trang web cho bất kỳ một bên thứ ba nào khác.
                </p>
                <p>
                  - Thông tin cá nhân thu thập được sẽ chỉ được sử dụng trong nội bộ công ty. Khi quý khách
                  đăng ký tài khoản hoặc đặt hàng trực tiếp tại Banhkemsaigon.vn, thông tin cá nhân mà chúng
                  tôi thu thập bao gồm:
                </p>
                <p>- Địa chỉ Email;</p>
                <p>- Tên;</p>
                <p>- Số điện thoại;</p>
                <p>- Địa chỉ giao hàng;</p>
                <p>- Nickname;</p>
                <p>
                  - Mọi thông tin khai báo phải đảm bảo tính chính xác và hợp pháp. AnBarkery không chịu mọi
                  trách nhiệm liên quan đến pháp luật của thông tin khai báo.
                </p>
                <p>- Những thông tin trên sẽ được sử dụng cho một hoặc tất cả các mục đích sau đây:</p>
                <p>- Thông báo về việc giao hàng và hỗ trợ khách hàng</p>
                <p>- Cung cấp thông tin liên quan đến sản phẩm</p>
                <p>
                  - Chi tiết đơn hàng của quý khách sẽ được chúng tôi lưu trữ nhưng vì lý do bảo mật, quý
                  khách không thể yêu cầu thông tin đó từ chúng tôi. Tuy nhiên, quý khách có thể kiểm tra
                  thông tin đó bằng cách đăng nhập{" "}
                </p>
                <p>
                  - Chúng tôi có thể chia sẻ tên, số điện thoại và địa chỉ của quý khách cho dịch vụ chuyển
                  phát nhanh để có thể giao hàng cho quý khách. Khi quý khách đăng ký làm thành viên trên
                  trang web AnBarkery chúng tôi cũng sẽ sử dụng thông tin cá nhân của quý khách để gửi các
                  thông tin khuyến mãi/tiếp thị. Quý khách có thể hủy nhận các thông tin đó bất kỳ lúc nào
                  bằng cách sử dụng chức năng hủy đăng ký trong các thông báo quảng cáo.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <h5>3- Thời gian lưu trữ thông tin</h5>
              <div className="flex flex-col gap-x-2 gap-y-2">
                <p>
                  - Anbarkery sẽ lưu trữ các thông tin cá nhân do khách hàng cung cấp trên các hệ thống nội bộ
                  của chúng tôi trong quá trình cung cấp dịch vụ cho khách hàng hoặc cho đến khi hoàn thành
                  mục đích thu thập hoặc khi Khách hàng có yêu cầu hủy các thông tin đã cung cấp.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <h5>3- Cam kết bảo mật thông tin cá nhân khách hàng</h5>
              <div className="flex flex-col gap-x-2 gap-y-2">
                <p>
                  - Chúng tôi rất quan tâm đến quyền riêng tư của quý khách khi quý khách sử dụng những dịch
                  vụ của chúng tôi. Chúng tôi cũng hiểu rằng quý khách sẽ rất quan tâm đến việc những thông
                  tin mà quý khách cũng cấp cho chúng tôi có được bảo mật an toàn hay không. Và chúng tôi luôn
                  muốn quý khách sẽ thật yên tâm và tin tưởng khi tham gia các dịch vụ của chúng tôi. Vì vậy
                  chúng tôi cam kết sẽ khiến quý khách có những trải nghiệm tuyệt vời nhất khi mua sắm hàng
                  của chúng tôi với sự tin tưởng hoàn toàn.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Image src={anbakery} className="mx-auto block w-52 py-4" />
          </div>
        </div> */}
        <div className="w-full rounded-lg border p-4 max-lg:order-1 lg:order-2 lg:col-span-9">
          <h3>Chính sách thanh toán - AnBakery</h3>
          <div className="mt-4 flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <h5>1. Chính Sách Thanh Toán</h5>
              <div className="flex flex-col gap-x-2 gap-y-2">
                <p>- Phương thức thanh toán: Tiền mặt, thẻ, chuyển khoản, ví điện tử.</p>
                <p>- Bảo mật thanh toán: Cam kết bảo vệ thông tin thanh toán.</p>
                <p>- Quy trình thanh toán trực tuyến: Các bước thực hiện khi thanh toán online.</p>
                <p>- Hoàn tiền: Chính sách hoàn tiền khi hủy đơn hàng.</p>
                <p>- Phí thanh toán: Các loại phí liên quan khi thanh toán.</p>
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <h5>2. Chính Sách Khuyến Mãi</h5>
              <div className="flex flex-col gap-x-2 gap-y-2">
                <p>- Đối tượng áp dụng: Ai có thể nhận ưu đãi.</p>
                <p>- Thời gian áp dụng: Thời gian hiệu lực của từng khuyến mãi.</p>
                <p>- Quy định sử dụng voucher: Hạn sử dụng, điều kiện áp dụng.</p>
                <p>- Cách thức nhận ưu đãi: Hướng dẫn nhận và sử dụng mã khuyến mãi.</p>
                <p>- Lưu ý: Các trường hợp không được áp dụng khuyến mãi.</p>
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <h5>3. Điều Khoản Sử Dụng</h5>
              <div className="flex flex-col gap-x-2 gap-y-2">
                <p>- Phạm vi áp dụng: Đối tượng và phạm vi sử dụng dịch vụ.</p>
                <p>- Quyền và trách nhiệm của khách hàng: Điều khoản khi sử dụng dịch vụ.</p>
                <p>- Quyền và trách nhiệm của công ty: Quyền hạn và trách nhiệm của công ty.</p>
                <p>- Các hành vi bị nghiêm cấm: Các hoạt động cấm khi sử dụng website.</p>
                <p>- Điều khoản thay đổi: Quy định về việc thay đổi điều khoản.</p>
              </div>
            </div>
            <div className="flex flex-col gap-y-2">
              <h5>4. Chính Sách Bảo Vệ Quyền Lợi Khách Hàng</h5>
              <div className="flex flex-col gap-x-2 gap-y-2">
                <p>- Cam kết về chất lượng sản phẩm: Đảm bảo tiêu chuẩn và an toàn.</p>
                <p>- Hỗ trợ và chăm sóc khách hàng: Quy định về hỗ trợ khách hàng sau bán hàng.</p>
                <p>- Giải quyết khiếu nại: Các bước giải quyết khiếu nại và phản hồi.</p>
                <p>- Chính sách bảo vệ người tiêu dùng: Tuân thủ quy định pháp luật.</p>
                <p>- Chính sách xử lý vi phạm: Quy định khi phát hiện vi phạm.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Image src={anbakery} className="mx-auto block w-52 py-4" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Poh6cy;
