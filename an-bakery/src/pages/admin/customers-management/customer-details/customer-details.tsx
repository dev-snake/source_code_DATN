import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import ModalConfirm from "@/components/admin/modal-confirm";
import { iconSize } from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICustomer } from "@/types/customer";
import { IOrder } from "@/types/order";
import { formatDate } from "@/utils/format-date";
import { sliceText } from "@/utils/slice-text";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { BiLockOpen, BiSolidLockAlt } from "react-icons/bi";
import { useParams } from "react-router-dom";
import OrderHistory from "./order-history";

const CustomerDetails = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isOpenConfirm, onOpen: onOpenConfirm, onOpenChange: onOpenChangeConfirm } = useDisclosure();
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const staffAxios = useStaffAxios();
  const { userId } = useParams();
  const [customerInfo, setCustomerInfo] = useState<ICustomer>();
  const [customerOrders, setCustomerOrders] = useState<IOrder[]>([]);
  const [customerOrdersMetadata, setCustomerOrdersMetadata] = useState<IPaginationMetadata>();
  const [blockReason, setBlockReason] = useState<string>("");
  const [currentOrdersPage, setCurrentOrdersPage] = useState<number>(1);

  const getCustomerOrders = (userId: string) => {
    return staffAxios
      .get<IAPIResponse<IOrder[]>>(apiRoutes.customers.orders(userId), {
        params: {
          page: currentOrdersPage,
          limit: 5,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setCustomerOrders(response.results);
        setCustomerOrdersMetadata(response.metadata);
      })
      .catch((error) => {
        const { data } = error.response;
        setCustomerOrders(data.results);
        setCustomerOrdersMetadata(data.metadata);
      });
  };

  const getCustomerInfo = (userId: string) => {
    return staffAxios
      .get<IAPIResponse<ICustomer>>(apiRoutes.customers.getOne(userId))
      .then((response) => response.data)
      .then((response) => {
        setCustomerInfo(response.results);
      })
      .catch((error) => console.log(error));
  };

  const handleBlockCustomer = (userId: string, onClose: () => void) => {
    onClose();
    staffAxios
      .post<IAPIResponse<ICustomer>>(apiRoutes.customers.block(userId as string), { blockReason })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          console.log(response);
          getCustomerInfo(userId);
        }
      })
      .catch((error) => console.log(error));
  };
  const handleUnblockCustomer = (userId: string, onClose: () => void) => {
    onClose();
    staffAxios
      .post<IAPIResponse<ICustomer>>(apiRoutes.customers.unblock(userId as string))
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          console.log(response);
          getCustomerInfo(userId);
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    if (!userId) {
      return;
    }

    Promise.all([getCustomerInfo(userId), getCustomerOrders(userId)]).finally(() => setIsFetching(false));
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    getCustomerOrders(userId);
  }, [currentOrdersPage]);

  return (
    <WrapperContainer>
      {customerInfo && (
        <>
          <ModalConfirm
            message="Bạn có chắc chắn muốn mở tài khoản này ?"
            isOpen={isOpenConfirm}
            onClose={onOpenChangeConfirm}
            onConfirm={() => handleUnblockCustomer(customerInfo?._id, onOpenChangeConfirm)}
          />

          <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Nhập lý do khóa tài khoản này ?</ModalHeader>
                  <ModalBody>
                    <Textarea size="lg" onValueChange={(value) => setBlockReason(value)} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="default" variant="light" onPress={onClose}>
                      Hủy
                    </Button>
                    <Button color="danger" onPress={() => handleBlockCustomer(customerInfo._id, onClose)}>
                      Xác nhận
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
      <AdminHeader title="Thông tin khách hàng" refBack={adminRoutes.customer.root} showBackButton={true} />
      <div className="grid max-xl:gap-y-4 xl:grid-cols-2 xl:gap-x-4">
        <div className={"flex flex-col gap-4"}>
          <div className="flex flex-col items-center gap-4 rounded-2xl border bg-gradient-to-r from-primary/10 to-secondary/20 p-4 shadow-custom">
            <div className="flex flex-col gap-8">
              <div className={"flex w-full flex-col items-center justify-center gap-2"}>
                <p className={"text-dark/50"}>{customerInfo ? `#${sliceText(customerInfo._id)}` : "-"}</p>
                <h3>{customerInfo?.userName ?? "-"}</h3>
                <p className={"italic text-dark/50"}>{customerInfo?.email ?? "-"}</p>
              </div>
              <div className={"flex flex-col items-center gap-2"}>
                <Chip color={(customerInfo?.isActive ?? "warning") ? "success" : "danger"} variant={"flat"}>
                  {(customerInfo?.isActive ?? "-") ? "Đang hoạt động" : "Đã khóa"}
                </Chip>
                {customerInfo?.isActive ? (
                  <Button
                    color="danger"
                    startContent={<BiSolidLockAlt size={iconSize.base} />}
                    onPress={onOpen}
                  >
                    Khóa tài khoản này
                  </Button>
                ) : (
                  <Button
                    color="success"
                    startContent={<BiLockOpen size={iconSize.base} />}
                    onPress={onOpenConfirm}
                  >
                    Mở khóa tài khoản này
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className={"w-full"}>
            <Table>
              <TableHeader>
                <TableColumn>Lần</TableColumn>
                <TableColumn>Thời gian</TableColumn>
                <TableColumn>Lí do</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={
                  isFetching ? <Loading /> : <p className={"italic"}>Tài khoản này chưa từng bị khóa</p>
                }
              >
                {(customerInfo?.blockHistory ?? []).map((history, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{formatDate(history.blockTime)}</TableCell>
                    <TableCell>{history.blockReason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <OrderHistory
          customerOrders={customerOrders}
          customerOrdersMetadata={customerOrdersMetadata}
          onChangePage={setCurrentOrdersPage}
          isFetching={isFetching}
        />
      </div>
    </WrapperContainer>
  );
};

export default CustomerDetails;
