import { ReMapSupplyItem } from "@/types/supplier";
import { formatCurrencyVND } from "@/utils/money-format";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";

interface SupplyItemsListProps {
  supplyItems: ReMapSupplyItem[];
}

const SupplyItemsList = ({ supplyItems }: SupplyItemsListProps) => (
  <div className="flex flex-col gap-4 rounded-2xl border p-4 shadow-custom">
    <span className={"w-max border-b-1 border-dark"}>
      <h5>Danh sách mặt hàng cung cấp</h5>
    </span>
    <Table aria-label="Danh sách mặt hàng cung cấp">
      <TableHeader>
        <TableColumn>TÊN NGUYÊN/VẬT LIỆU</TableColumn>
        <TableColumn className={"text-center"}>CÁCH ĐÓNG GÓI</TableColumn>
        <TableColumn className={"text-center"}>SẢN PHẨM / KIỆN</TableColumn>
        <TableColumn className={"text-center"}>TRỌNG LƯỢNG SẢN PHẨM</TableColumn>
        <TableColumn className={"text-center"}>GIÁ ĐỀ XUẤT</TableColumn>
      </TableHeader>
      <TableBody>
        {supplyItems.map((item) => (
          <TableRow key={item.materialId?._id}>
            <TableCell>{item.materialId?.materialName}</TableCell>
            <TableCell className={"text-center"}>{item.materialSpecs.baseUnit}</TableCell>
            <TableCell className={"text-center"}>{item.materialSpecs.packsPerUnit}</TableCell>
            <TableCell className={"text-center"}>
              {item.materialSpecs.quantityPerPack.toLocaleString("vi-VN")} {item.materialId?.calUnit}
            </TableCell>
            <TableCell className={"text-center"}>
              {formatCurrencyVND(item.materialSpecs.pricePerUnit)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default SupplyItemsList;
