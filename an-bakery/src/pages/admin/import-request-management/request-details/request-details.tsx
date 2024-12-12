import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { IImportRequest, IRequestItem, TRequestStatus } from "@/types/import-request";
import {
  MapImportStatusColor,
  MapImportStatusText,
  MapRequestStatusColor,
  MapRequestStatusText,
} from "@/types/import-request-map";
import { formatCurrencyVND } from "@/utils/money-format";
import {
  Button,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface RequestDetailsProps {}

const RequestDetails = (props: RequestDetailsProps) => {
  const currentStaffRole = useRole();
  const currentBranch = useCurrentBranch();
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();
  const { requestId } = useParams<{ requestId: string }>();

  const [requestData, setRequestData] = useState<IImportRequest>();
  const [requestItems, setRequestItems] = useState<IRequestItem[]>([]);
  const getRequestDetails = () => {
    if (!requestId) {
      return;
    }
    staffAxios
      .get<IAPIResponse<IImportRequest>>(apiRoutes.importRequests.getOne(requestId))
      .then((response) => response.data)
      .then((response) => {
        if (currentStaffRole !== 2 && response.results.branchId._id !== currentBranch) {
          toast.error("Bạn không thể xem yêu cầu nhập hàng không thuộc chi nhánh quản lí");
          return navigate(adminRoutes.importRequests.root);
        }

        setRequestData(response.results);
        setRequestItems(response.results.requestItems);
      });
  };

  const handleChangeImportStatus = (listMaterials: string[]) => {
    if (!requestId) {
      return;
    }
    staffAxios
      .patch(apiRoutes.importRequests.updateStatus(requestId), {
        requestItems: listMaterials,
        requestStatus:
          listMaterials.length === requestItems.length ? "completed" : requestData?.requestStatus,
        isSingle:
          listMaterials.length === requestItems.length ? false : listMaterials.length === 1 ? true : false,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Nhập vào kho thành công");
          getRequestDetails();
        }
      });
  };

  const handleConfirmImport = () => {
    if (!requestId) {
      return;
    }
    Promise.all([handleChangeRequestStatus("completed")]).then(() =>
      toast.success("Hoàn tất việc nhập hàng"),
    );
  };

  const handleChangeRequestStatus = (requestStatus: TRequestStatus) => {
    if (!requestId) {
      return;
    }
    staffAxios
      .patch(apiRoutes.importRequests.updateStatus(requestId), {
        requestStatus,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          getRequestDetails();
        }
      });
  };

  useEffect(() => {
    getRequestDetails();
  }, []);

  return (
    <WrapperContainer>
      <AdminHeader
        title="CHI TIẾT YÊU CẦU NHẬP HÀNG"
        showBackButton={true}
        refBack={adminRoutes.importRequests.root}
      />
      <div className={"flex w-full flex-col gap-8"}>
        <div className={"grid w-full grid-cols-2 items-center gap-4"}>
          <div className="col-span-1 flex w-full flex-col gap-4 rounded-xl border p-4 shadow-custom">
            <h4 className={"w-full text-center font-bold text-primary"}>BÊN NHẬP HÀNG</h4>

            <Input
              label={"Cơ sở nhập hàng: "}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={requestData?.branchId.branchConfig.branchDisplayName}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Đại diện bên nhập:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={requestData?.branchId.branchConfig.branchContact.branchOwnerName}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Số điện thoại bên nhập:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={requestData?.branchId.branchConfig.branchContact.branchPhoneNumber}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
          </div>
          <div className="col-span-1 flex w-full flex-col gap-4 rounded-xl border p-4 shadow-custom">
            <h4 className={"w-full text-center font-bold text-primary"}>BÊN CUNG CẤP</h4>

            <Input
              label={"Tên công ty cung cấp: "}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={requestData?.supplierId.supplierName ?? "-"}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Đại diện bên cung cấp:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={requestData?.supplierId.supplierContactPerson.name ?? "-"}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
            <Input
              label={"Số điện thoại bên cung cấp:"}
              labelPlacement={"outside-left"}
              size={"lg"}
              fullWidth={true}
              value={requestData?.supplierId.supplierContactPerson.phone ?? "-"}
              classNames={{ label: "text-base min-w-max", input: "w-full", mainWrapper: "w-full" }}
              isReadOnly={true}
            />
          </div>
        </div>
        <div className={"flex w-full flex-col gap-4 shadow-custom"}>
          <Table
            topContent={
              <div className={"flex w-full items-center justify-between"}>
                <h4 className={"font-bold text-primary"}>DANH SÁCH MẶT HÀNG YÊU CẦU</h4>
                {requestData?.requestStatus === "waiting" && (
                  <Button
                    color={"success"}
                    startContent={iconConfig.tick.base}
                    onClick={() =>
                      handleChangeImportStatus(
                        requestItems.filter((item) => !item.importStatus).map((x) => x.materialId._id),
                      )
                    }
                  >
                    Cập nhật tất cả
                  </Button>
                )}
              </div>
            }
            bottomContent={
              <div className={"flex w-full items-center justify-between gap-4 px-4 py-2"}>
                <div className={"flex items-center gap-2"}>
                  <p>Trạng thái yêu cầu:</p>
                  <Chip color={MapRequestStatusColor[requestData?.requestStatus as string]}>
                    {MapRequestStatusText[requestData?.requestStatus as string]}
                  </Chip>
                </div>
                <div className={"flex items-center gap-2"}>
                  <p>Tổng thành tiền:</p>
                  <p className={"text-2xl font-bold text-primary"}>
                    {formatCurrencyVND(requestData?.requestTotalPrice ?? 0)}
                  </p>
                </div>
              </div>
            }
          >
            <TableHeader>
              <TableColumn key={"index"} className={"text-center"}>
                STT
              </TableColumn>
              <TableColumn key={"item"} className={"text-center"}>
                Sản phẩm nhập
              </TableColumn>
              <TableColumn key={"quantity"} className={"text-center"}>
                Số lượng
              </TableColumn>
              <TableColumn key={"cal-unit"} className={"text-center"}>
                Đơn vị tính
              </TableColumn>
              <TableColumn key={"total-volume"} className={"text-center"}>
                Tổng nhập kho
              </TableColumn>
              <TableColumn key={"unit-price"} className={"text-center"}>
                Đơn giá
              </TableColumn>
              <TableColumn key={"total-price"} className={"text-center"}>
                Thành tiền
              </TableColumn>
              <TableColumn key={"import-status"} className={"text-center"}>
                Trạng thái nhập hàng
              </TableColumn>
              <TableColumn key={"actions"} className={"text-center"}>
                Hành động
              </TableColumn>
            </TableHeader>
            <TableBody aria-label={"Bảng nhập hàng"}>
              {requestItems.map((item, index) => (
                <TableRow key={item.materialId?._id}>
                  <TableCell className={"text-center"}>{index + 1}</TableCell>
                  <TableCell className="text-center">{item.materialId?.materialName}</TableCell>
                  <TableCell className={"text-center"}>{item.importQuantity}</TableCell>
                  <TableCell className={"text-center"}>{item.packageType.baseUnit}</TableCell>
                  <TableCell className={"text-center"}>
                    {(
                      item.importQuantity *
                      item.packageType.packsPerUnit *
                      item.packageType.quantityPerPack
                    ).toLocaleString()}{" "}
                    {item.materialId?.calUnit}
                  </TableCell>
                  <TableCell className={"text-center"}>{formatCurrencyVND(item.importPrice)}</TableCell>
                  <TableCell className={"text-center"}>
                    {formatCurrencyVND(item.importPrice * item.importQuantity)}
                  </TableCell>
                  <TableCell className={"text-center"}>
                    <Chip color={MapImportStatusColor[item.importStatus.toString()]} variant={"flat"}>
                      {MapImportStatusText[item.importStatus.toString()]}
                    </Chip>
                  </TableCell>
                  <TableCell className={"text-center"}>
                    {currentStaffRole &&
                      currentStaffRole > 0 &&
                      !["completed", "pending", "confirmed"].includes(requestData?.requestStatus as string) &&
                      !item.importStatus && (
                        <Button
                          isIconOnly
                          color={"success"}
                          variant={"ghost"}
                          onClick={() => handleChangeImportStatus([item.materialId._id])}
                        >
                          {iconConfig.tick.base}
                        </Button>
                      )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {currentStaffRole &&
            currentStaffRole > 0 &&
            !["completed", "pending", "confirmed"].includes(requestData?.requestStatus as string) &&
            requestItems.every((item) => item.importStatus) && (
              <Button color={"primary"} onClick={handleConfirmImport}>
                Xác nhận hoàn thành nhập hàng
              </Button>
            )}

          {currentStaffRole === 2 && requestData?.requestStatus === "pending" && (
            <Button color={"success"} onClick={() => handleChangeRequestStatus("confirmed")}>
              Chấp nhận yêu cầu
            </Button>
          )}
          {currentStaffRole === 2 && requestData?.requestStatus === "confirmed" && (
            <Button color={"secondary"} onClick={() => handleChangeRequestStatus("waiting")}>
              Chuyển trạng thái chờ nhập hàng
            </Button>
          )}
        </div>
      </div>
    </WrapperContainer>
  );
};

export default RequestDetails;
