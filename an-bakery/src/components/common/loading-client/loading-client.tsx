import { Spinner } from "@nextui-org/react";

const LoadingClient = () => (
  <div className="mx-auto flex w-full justify-center p-4">
    <Spinner size="md" label="Đang tải dữ liệu" />
  </div>
);

export default LoadingClient;
