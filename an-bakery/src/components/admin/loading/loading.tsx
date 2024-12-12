import { Spinner } from "@nextui-org/react";
interface LoadingProps {
  message?: string;
}

const Loading = ({ message = "Đang tải dữ liệu" }: LoadingProps) => (
  <div className="col-span-10 mx-auto place-self-stretch py-10">
    <Spinner color="primary" label={message} labelColor="primary" />
  </div>
);

export default Loading;
