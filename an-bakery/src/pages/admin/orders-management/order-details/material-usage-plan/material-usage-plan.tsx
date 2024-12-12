import { TMaterialPlanOrder } from "@/types/branch";
import { addCommas } from "@/utils/add-comma";
import { cn, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import clsx from "clsx";

interface MaterialUsagePlanProps {
  materialUsage: TMaterialPlanOrder[];
}
const MaterialUsagePlan: React.FC<MaterialUsagePlanProps> = ({ materialUsage }) => {
  return (
    <Table
      classNames={{
        td: "text-lg",
        tr: "text-lg",
      }}
      topContent={<h5>Kế hoạch sử dụng nguyên liệu cho đơn hàng này</h5>}
    >
      <TableHeader>
        <TableColumn align={"start"}>KHỐI LƯỢNG SỬ DỤNG</TableColumn>
        <TableColumn align={"center"}>TÊN NGUYÊN LIỆU</TableColumn>
        <TableColumn align={"end"}>KHỐI LƯỢNG TRONG KHO</TableColumn>
      </TableHeader>
      <TableBody emptyContent={"Không có dữ liệu kế hoạch"}>
        {materialUsage?.map((material) => (
          <TableRow>
            <TableCell
              className={clsx("font-semibold", {
                "text-danger": material.empty,
                "text-success": !material.empty,
              })}
            >
              {(material?.quantity ?? 0).toLocaleString("vi-VN")} {material.materialId.calUnit}
            </TableCell>
            <TableCell className={"font-semibold"}>{material.materialId.materialName}</TableCell>
            <TableCell
              className={clsx("font-semibold", {
                "text-danger": material.empty,
                "text-success": !material.empty,
              })}
            >
              {material.inventoryVolume.toLocaleString("vi-VN")} {material.materialId.calUnit}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MaterialUsagePlan;
