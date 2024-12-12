import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { iconSize } from "@/config/icons/icon-config";

const FeedbackCustomers = () => (
  <div>
    <h1 className="my-16 text-center text-8xl uppercase text-default-300 max-lg:text-7xl max-md:text-6xl max-sm:text-4xl">
      FEEDBACK TỪ KHÁCH
    </h1>
    <div className="mx-auto flex items-center justify-center gap-8">
      <FaChevronLeft size={iconSize.large} className="text-danger-50 hover:cursor-pointer max-md:size-16" />
      <div className="w-[700px] rounded-2xl shadow-2xl">
        <h3 className="pb-11 pt-7 text-center text-primary max-sm:text-2xl">devsnake</h3>
        <p className="mx-8 text-justify text-base max-sm:text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellat perferendis nostrum laboriosam
          voluptates natus vitae, ducimus dolorum? Consequatur natus possimus odit labore numquam tempora
          magnam praesentium
        </p>
        <p className="mt-16 pb-8 text-center text-base text-default-300">21:00 - 02/08/2024</p>
      </div>
      <FaChevronRight
        size={iconSize.large}
        className="text-danger-50 hover:cursor-pointer max-md:size-16 max-sm:size-14"
      />
    </div>
  </div>
);

export default FeedbackCustomers;
