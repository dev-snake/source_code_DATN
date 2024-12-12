import { Image } from "@nextui-org/react";
import bannerFAQs from "@/assets/images/FAQ Banner.png";
import { Accordion, AccordionItem } from "@nextui-org/react";
import axios from "axios";
import { useEffect } from "react";
const FaQs = () => {
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  useEffect(() => {
    axios
      .get("/vietnam_provinces_data.json")
      .then((res) => res.data)
      .then((data) => console.log(data.results));
  }, []);
  return (
    <section>
      <Image src={bannerFAQs} />
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 mt-20 text-center">
          <h1>CÂU HỎI THƯỜNG GẶP ?</h1>
          <h6 className="mt-4">
            Chào mừng đến trang FAQ của chúng tôi, chúng tôi sẽ giải thích những câu hỏi thường hỏi thường
            xuyên về các loại bánh trong shop anbakery của chúng tôi.
          </h6>
        </div>{" "}
        <Accordion>
          <AccordionItem key="1" aria-label="Accordion 1" title="Làm thế nào để đặt bánh?">
            {defaultContent}
          </AccordionItem>
          <AccordionItem key="2" aria-label="Accordion 2" title="Tôi cần đặt bánh trước bao lâu?">
            {defaultContent}
          </AccordionItem>
          <AccordionItem
            key="3"
            aria-label="Accordion 3"
            title="Chính sách hoàn trả và hủy đơn hàng như thế nào?"
          >
            {defaultContent}
          </AccordionItem>
          <AccordionItem
            key="4"
            aria-label="Accordion 3"
            title="Bánh của shop có sử dụng chất bảo quản không?"
          >
            {defaultContent}
          </AccordionItem>
          <AccordionItem
            key="5"
            aria-label="Accordion 3"
            title="Có chương trình khuyến mãi hoặc giảm giá nào không?"
          >
            {defaultContent}
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

export default FaQs;
