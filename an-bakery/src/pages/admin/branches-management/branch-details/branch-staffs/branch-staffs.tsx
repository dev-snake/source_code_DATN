import adminRoutes from "@/config/routes/admin-routes.config";
import { IStaff } from "@/types/staff";
import { Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

interface BranchStaffsProps {
  listStaffs: IStaff[];
}

const BranchStaffs = ({ listStaffs }: BranchStaffsProps) => {
  const navigate = useNavigate();

  return (
    <div className={"flex flex-col gap-2 pb-4"}>
      <Table>
        <TableHeader>
          <TableColumn>MÃ NHÂN VIÊN</TableColumn>
          <TableColumn>TÊN NHÂN VIÊN</TableColumn>
        </TableHeader>
        <TableBody emptyContent={<p className={"italic"}>Chi nhánh không có quản lí nào</p>}>
          {listStaffs.map((staff, index) => (
            <TableRow key={index}>
              <TableCell>{staff.staffCode}</TableCell>
              <TableCell>{staff.staffName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={"flex w-full justify-center"}>
        <Button
          color={"primary"}
          variant={"light"}
          className={"w-max"}
          onClick={() => navigate(adminRoutes.staff.root)}
        >
          Xem tất cả
        </Button>
      </div>
    </div>
  );
};

export default BranchStaffs;
