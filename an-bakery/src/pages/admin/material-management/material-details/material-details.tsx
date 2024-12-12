import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useStaffAxios from "@/hooks/useStaffAxios";
import MaterialStatsChart from "@/pages/admin/material-management/material-details/material-stats-chart";
import { IAPIResponse } from "@/types/api-response";
import { IBranch } from "@/types/branch";
import { IMaterial, IMaterialStats } from "@/types/material";
import { ISupplier } from "@/types/supplier";
import { formatCurrencyVND } from "@/utils/money-format";
import { Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MaterialDetails = () => {
  const { materialId } = useParams<{ materialId: string }>();

  const staffAxios = useStaffAxios();

  const [materialData, setMaterialData] = useState<IMaterial>();

  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [listSuppliers, setListSuppliers] = useState<ISupplier[]>([]);
  const [listAnalyticsMaterial, setListAnalyticsMaterial] = useState<IMaterialStats[]>([]);

  const [isFetching, setIsFetching] = useState<boolean>(true);

  const getMaterialDetails = (materialId: string) => {
    staffAxios
      .get<IAPIResponse<IMaterial>>(apiRoutes.materials.detail(materialId))
      .then((response) => response.data)
      .then((response) => {
        setMaterialData(response.results);
      });
  };

  const getAnalyticsForMaterial = (materialId: string) => {
    staffAxios
      .get<IAPIResponse<IMaterialStats[]>>(apiRoutes.materials.getAnalytics(materialId))
      .then((response) => response.data)
      .then((response) => {
        setListAnalyticsMaterial(response.results);
      });
  };

  const getListBranchContainMaterials = (materialId: string) => {
    staffAxios
      .get<IAPIResponse<IBranch[]>>(apiRoutes.materials.getListBranches(materialId))
      .then((response) => response.data)
      .then((response) => {
        setListBranches(response.results);
      });
  };

  const getSupplierOfMaterial = (materialId: string) => {
    staffAxios
      .get<IAPIResponse<ISupplier[]>>(apiRoutes.materials.getListSuppliers(materialId))
      .then((response) => response.data)
      .then((response) => {
        setListSuppliers(response.results);
      });
  };

  useEffect(() => {
    if (!materialId) {
      return;
    }

    Promise.all([
      getMaterialDetails(materialId),
      getListBranchContainMaterials(materialId),
      getSupplierOfMaterial(materialId),
      getAnalyticsForMaterial(materialId),
    ]).finally(() => {
      setIsFetching(false);
    });
  }, [materialId]);

  if (!materialId || !materialData || !listBranches) {
    return <Loading />;
  }

  return (
    <WrapperContainer>
      <AdminHeader title="Chi tiết nguyên liệu" refBack={adminRoutes.materials.root} showBackButton={true} />
      <div className="grid max-xl:gap-y-4 xl:grid-cols-2 xl:gap-x-4">
        <div className={"flex flex-col gap-4"}>
          <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
            <h5 className="">
              Thông tin {materialData.materialType === "baking-ingredient" ? "nguyên liệu" : "phụ kiện"}
            </h5>
            <div className="flex flex-col gap-4">
              <Input
                label={"Mã nguyên liệu"}
                labelPlacement={"outside"}
                size={"lg"}
                value={materialData._id}
                isReadOnly
              />
              <Input
                label={materialData.materialType === "baking-ingredient" ? "Tên nguyên liệu" : "Tên phụ kiện"}
                labelPlacement={"outside"}
                size={"lg"}
                value={materialData.materialName}
                isReadOnly
              />
              <Input
                label={"Đơn vị tính"}
                labelPlacement={"outside"}
                size={"lg"}
                value={materialData.calUnit}
                isReadOnly
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border p-4 shadow-custom">
            <h5 className="">Danh sách nhà cung cấp </h5>
            <Table aria-label="Table show branches contain material" removeWrapper>
              <TableHeader>
                <TableColumn>TÊN NHÀ CUNG CẤP</TableColumn>
                <TableColumn className={"text-right"}>GIÁ</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={isFetching ? <Loading /> : <p className={"italic"}>Không có chi nhánh nào</p>}
              >
                {listSuppliers.map((supplier) => (
                  <TableRow key={supplier._id}>
                    <TableCell>{supplier.supplierName}</TableCell>
                    <TableCell className={"text-right"}>
                      {formatCurrencyVND(
                        supplier.supplyItems.find((item) => item.materialId._id === materialId)?.materialSpecs
                          .pricePerUnit ?? 0,
                      )}
                      /
                      {
                        supplier.supplyItems.find((item) => item.materialId._id === materialId)?.materialSpecs
                          .baseUnit
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border p-4 shadow-custom">
            <h5 className="">Chi nhánh đang tồn nguyên liệu</h5>
            <Table aria-label="Table show branches contain material" removeWrapper>
              <TableHeader>
                <TableColumn>TÊN CHI NHÁNH</TableColumn>
                <TableColumn className={"text-right"}>TỒN KHO</TableColumn>
              </TableHeader>
              <TableBody
                emptyContent={isFetching ? <Loading /> : <p className={"italic"}>Không có chi nhánh nào</p>}
              >
                {listBranches.map((branch) => (
                  <TableRow key={branch._id}>
                    <TableCell>{branch.branchConfig.branchDisplayName}</TableCell>
                    <TableCell className={"text-right"}>
                      {branch.branchInventory?.materials
                        .find((item) => item.materialId._id === materialId)
                        ?.inventoryVolume.toLocaleString()}{" "}
                      {materialData.calUnit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="rounded-2xl border p-4 shadow-custom">
          {/* <h5 className="mb-4">Mức tiêu thụ nguyên liệu</h5> */}
          <MaterialStatsChart statsList={listAnalyticsMaterial} calUnit={materialData.calUnit} />
        </div>
      </div>
    </WrapperContainer>
  );
};

export default MaterialDetails;
