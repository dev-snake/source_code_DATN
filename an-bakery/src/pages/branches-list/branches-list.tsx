import Introduction from "./introduction";
import iconConfig from "@/config/icons/icon-config";
import { Button, Input } from "@nextui-org/react";
import GoogleMap from "@/components/common/google-map";
import { useEffect, useState } from "react";
import { IBranch } from "@/types/branch";
import useAxios from "@/hooks/useAxios";
import { IAPIResponse } from "@/types/api-response";
import { apiRoutes } from "@/config/routes/api-routes.config";
import LoadingClient from "@/components/common/loading-client";
const BranchesList = () => {
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [listBranchesCopy, setListBranchesCopy] = useState<IBranch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRemoveSearch, setIsRemoveSearch] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const axiosClient = useAxios();
  const handleSearchBranch = () => {
    if (searchValue === "") {
      setListBranches(listBranchesCopy);
    } else {
      setIsRemoveSearch(true);
      const filteredBranches = listBranches.filter((branch) =>
        branch.branchConfig.branchDisplayName.toLowerCase().includes(searchValue.toLowerCase()),
      );
      setListBranches(filteredBranches);
    }
  };
  useEffect(() => {
    axiosClient
      .get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll + "?noPagination=true")
      .then((response) => response.data)
      .then((data) => {
        setListBranchesCopy(data.results);
        setListBranches(data.results);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);
  if (isLoading) return <LoadingClient />;

  return (
    <section>
      <div className="mx-auto mt-8 max-w-7xl max-xl:px-4">
        <Introduction />
        <div className="mt-8 flex gap-x-4 max-lg:grid">
          <div className="basis-[524px]">
            <div className="flex gap-x-2">
              <Input
                placeholder="Nhập tên chi nhánh"
                size="lg"
                value={searchValue}
                variant="bordered"
                onValueChange={(value) => setSearchValue(value)}
              />
              <Button
                size="lg"
                color={isRemoveSearch ? "danger" : "primary"}
                className="lg:hidden"
                onClick={
                  isRemoveSearch
                    ? () => {
                        setIsRemoveSearch(false);
                        setSearchValue("");
                        setListBranches(listBranchesCopy);
                      }
                    : handleSearchBranch
                }
              >
                {isRemoveSearch ? "Xóa tìm kiếm" : "Tìm kiếm"}
              </Button>
            </div>
            <div className="mt-4 flex flex-col gap-y-2">
              {listBranches.map((branch, index) => (
                <div className={`flex flex-col gap-y-1 rounded-lg border p-2`} key={index}>
                  <span>
                    CN{index + 1} - {branch.branchConfig.branchDisplayName}
                  </span>
                  <span className="text-default-flat flex gap-x-2">
                    {iconConfig.timer.base} {branch.branchConfig.activeTime.open} -{" "}
                    {branch.branchConfig.activeTime.close} (tất cả các ngày trong tuần)
                  </span>
                  <span className="text-default-flat flex gap-2">
                    {iconConfig.phone.base}
                    {branch.branchConfig.branchContact.branchPhoneNumber} -{" "}
                    {branch.branchConfig.branchContact.branchOwnerName}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="grow">
            <Button
              size="lg"
              color={isRemoveSearch ? "danger" : "primary"}
              className="max-lg:hidden"
              onClick={
                isRemoveSearch
                  ? () => {
                      setIsRemoveSearch(false);
                      setSearchValue("");
                      setListBranches(listBranchesCopy);
                    }
                  : handleSearchBranch
              }
            >
              {isRemoveSearch ? "Xóa tìm kiếm" : "Tìm kiếm"}
            </Button>
            <div className="mt-4">
              <GoogleMap width={"100%"} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BranchesList;
