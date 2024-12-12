import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useRole from "@/hooks/useRole";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { IImportRequestForm, IRequestItem, IRequestItemForm } from "@/types/import-request";
import { ISupplier, ReMapSupplyItem } from "@/types/supplier";
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { newRequestColumns } from "../column";

interface NewRequestProps {}

const NewRequest = (props: NewRequestProps) => {
  const navigate = useNavigate();
  const staffAxios = useStaffAxios();

  const currentBranch = useCurrentBranch();
  const currentStaffRole = useRole();

  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [currentBranchData, setCurrentBranchData] = useState<IBranch>();

  const [listSupplyItems, setListSupplyItems] = useState<ReMapSupplyItem[]>([]);
  const [selectedSupplyItems, setSelectedSupplyItems] = useState<string[]>([]);

  const [listRequestItems, setListRequestItems] = useState<IRequestItemForm[]>([]);

  const [listSupplier, setListSupplier] = useState<ISupplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [requestTotalPrice, setRequestTotalPrice] = useState(0);

  const getListBranches = () => {
    if (currentStaffRole !== 2) {
      return;
    }

    staffAxios
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll)
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const getListSuppliers = () => {
    if (currentStaffRole === 2 && !selectedBranch) {
      return;
    }

    if (currentStaffRole !== 2 && currentBranch) {
      staffAxios
        .get(apiRoutes.branches.suppliers(currentBranch))
        .then((response) => response.data)
        .then((response) => {
          setListSupplier(response.results);
        });
    } else {
      staffAxios
        .get(apiRoutes.branches.suppliers(selectedBranch))
        .then((response) => response.data)
        .then((response) => {
          setListSupplier(response.results);
        });
    }
  };

  const getSupplierData = () => {
    staffAxios
      .get<IAPIResponse<ISupplier>>(apiRoutes.suppliers.getOne(selectedSupplier))
      .then((response) => response.data)
      .then((response) => {
        setListSupplyItems(response.results.supplyItems);
        setListRequestItems(
          response.results.supplyItems.map((item) => ({
            materialId: item.materialId?._id,
            packageType: item.materialSpecs._id ?? "",
            importQuantity: 1,
            importPrice: item.materialSpecs.pricePerUnit,
            importStatus: false,
          })),
        );
      });
  };

  const getBranchData = () => {
    if (currentStaffRole === 2 && !selectedBranch) {
      return;
    }

    if (currentStaffRole !== 2 && currentBranch) {
      staffAxios
        .get(apiRoutes.branches.getBranchInfo(currentBranch))
        .then((response) => response.data)
        .then((response) => {
          setCurrentBranchData(response.results);
        });
    } else {
      staffAxios
        .get(apiRoutes.branches.getBranchInfo(selectedBranch))
        .then((response) => response.data)
        .then((response) => {
          setCurrentBranchData(response.results);
        });
    }
  };

  const handleSelectionChange = (materialId: string) => {
    if (materialId === "all") {
      // return
    }
    if (selectedSupplyItems.includes(materialId)) {
      setSelectedSupplyItems((prevState) => prevState.filter((item) => item !== materialId));
    } else {
      setSelectedSupplyItems((prevState) => [...prevState, materialId]);
    }
  };

  console.log("selecetd", selectedSupplyItems);

  const handleConfigRequestItems = (
    materialId: string,
    field: keyof IRequestItem,
    value: string | number | boolean,
  ) => {
    const updatedRequestItems = listRequestItems.map((item) => {
      if (item.materialId === materialId) {
        return {
          ...item,
          [field]: value,
        };
      }
      return item;
    });

    setListRequestItems(updatedRequestItems);
  };

  const calculateRequestTotalPrice = () => {
    setRequestTotalPrice(
      listRequestItems
        .filter((item) => selectedSupplyItems.includes(item.materialId))
        .reduce((total, item) => total + item.importPrice * item.importQuantity, 0),
    );
  };

  const handleCreateRequest = () => {
    if (currentStaffRole === 2 && !selectedBranch) {
      return;
    }

    if (selectedSupplyItems.length === 0) {
      return toast.error("Vui lòng chọn ít nhất 1 mặt hàng để tạo yêu cầu");
    }

    if (listRequestItems.some((item) => item.importQuantity <= 0)) {
      return toast.error("Số lượng nhập phải lớn hơn 0");
    }

    if (currentStaffRole !== 2 && currentBranch) {
      const requestData: IImportRequestForm = {
        supplierId: selectedSupplier,
        branchId: currentBranch,
        requestItems: listRequestItems.filter((item) => selectedSupplyItems.includes(item.materialId)),
        requestTotalPrice,
      };
      staffAxios
        .post<IAPIResponse>(apiRoutes.branches.createImportRequests(currentBranch), requestData)
        .then((response) => response.data)
        .then((response) => {
          if (response.status === "success") {
            toast.success("Tạo yêu cầu thành công");
            navigate(adminRoutes.importRequests.root);
          }
        });
    } else {
      const requestData: IImportRequestForm = {
        supplierId: selectedSupplier,
        branchId: selectedBranch,
        requestItems: listRequestItems.filter((item) => selectedSupplyItems.includes(item.materialId)),
        requestTotalPrice,
      };
      staffAxios
        .post<IAPIResponse>(apiRoutes.branches.createImportRequests(selectedBranch), requestData)
        .then((response) => response.data)
        .then((response) => {
          if (response.status === "success") {
            toast.success("Tạo yêu cầu thành công");
            navigate(adminRoutes.importRequests.root);
          }
        });
    }
  };

  useEffect(() => {
    if (currentStaffRole === 2) {
      getListBranches();
    } else {
      getBranchData();
    }
  }, []);

  useEffect(() => {
    getListSuppliers();
  }, [currentBranch, selectedBranch]);

  useEffect(() => {
    if (!selectedSupplier) {
      return;
    }
    getSupplierData();
  }, [selectedSupplier]);

  useEffect(() => {
    calculateRequestTotalPrice();
  }, [selectedSupplyItems, listRequestItems]);

  return (
    <WrapperContainer>
      <AdminHeader
        title="YÊU CẦU NHẬP HÀNG MỚI"
        showBackButton={true}
        refBack={adminRoutes.importRequests.root}
      />
      <div className={"flex w-full flex-col gap-8"}>
        <div className={"grid w-full grid-cols-2 items-center gap-4"}>
          <div className="col-span-1 flex w-full flex-col gap-4">
            <div className={"flex items-center gap-2"}>
              <p className={"min-w-max"}>Cơ sở nhập hàng:</p>
              {currentStaffRole === 2 ? (
                <Select
                  aria-label={"Nhà cung cấp"}
                  selectedKeys={[selectedBranch]}
                  onSelectionChange={(e) => setSelectedBranch(Array.from(e).join(""))}
                >
                  {listBranches.map((branch) => (
                    <SelectItem key={branch._id}>{branch.branchConfig.branchDisplayName}</SelectItem>
                  ))}
                </Select>
              ) : (
                <p className={"font-bold"}>{currentBranchData?.branchConfig.branchDisplayName}</p>
              )}
            </div>
          </div>
          <div className="col-span-1 flex w-full flex-col gap-4">
            <div className={"flex items-center gap-2"}>
              <p className={"min-w-max"}>Nhà cung cấp:</p>
              <Select
                aria-label={"Nhà cung cấp"}
                selectedKeys={[selectedSupplier]}
                onSelectionChange={(e) => setSelectedSupplier(Array.from(e).join(""))}
              >
                {listSupplier.map((supplier) => (
                  <SelectItem key={supplier._id}>{supplier.supplierName}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className={"flex w-full flex-col gap-4"}>
          <Table
            bottomContent={
              <div className={"flex w-full items-center justify-end gap-4 px-4 py-2"}>
                <p>Tổng thành tiền:</p>
                <h5>{requestTotalPrice.toLocaleString()} VNĐ</h5>
              </div>
            }
          >
            <TableHeader columns={newRequestColumns}>
              {(cols) => (
                <TableColumn
                  key={cols.key}
                  className={clsx({ "text-center": !["check", "request-item"].includes(cols.key) })}
                >
                  {cols.key === "check" ? <Checkbox /> : cols.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody aria-label={"Bảng nhập hàng"}>
              {selectedSupplier
                ? listSupplyItems.map(({ materialId: material, materialSpecs }, index) => (
                    <TableRow key={material?._id}>
                      <TableCell>
                        <Checkbox
                          isSelected={selectedSupplyItems.includes(material?._id)}
                          onValueChange={() => handleSelectionChange(material?._id)}
                        ></Checkbox>
                      </TableCell>
                      <TableCell>{material?.materialName}</TableCell>
                      <TableCell className={"text-center"}>
                        <div className={"flex items-center justify-center"}>
                          <Input
                            type={"number"}
                            className={"max-w-60"}
                            isDisabled={selectedSupplyItems.includes(material?._id) ? false : true}
                            value={listRequestItems[index]?.importQuantity.toString()}
                            onValueChange={(e) =>
                              handleConfigRequestItems(material?._id, "importQuantity", +e)
                            }
                            variant={"bordered"}
                          />
                        </div>
                      </TableCell>
                      <TableCell className={"text-center"}>{materialSpecs.baseUnit}</TableCell>
                      <TableCell>
                        <div className={"flex items-center justify-center"}>
                          <Input
                            type={"number"}
                            className={"max-w-60"}
                            isDisabled={selectedSupplyItems.includes(material?._id) ? false : true}
                            value={listRequestItems[index]?.importPrice.toString()}
                            onValueChange={(e) => handleConfigRequestItems(material?._id, "importPrice", +e)}
                            endContent={"VNĐ"}
                            variant={"bordered"}
                          />
                        </div>
                      </TableCell>
                      <TableCell className={"text-center"}>
                        {selectedSupplyItems.includes(material?._id) ? (
                          `${(
                            listRequestItems[index]?.importPrice * listRequestItems[index]?.importQuantity
                          ).toLocaleString()} VNĐ`
                        ) : (
                          <span className={"text-gray-500"}>0 VNĐ</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                : []}
            </TableBody>
          </Table>
          <Button color={"primary"} onClick={handleCreateRequest} isDisabled={!selectedSupplier}>
            Tạo yêu cầu nhập hàng
          </Button>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default NewRequest;
