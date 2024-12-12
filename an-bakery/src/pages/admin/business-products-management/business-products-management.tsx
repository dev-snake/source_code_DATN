import AdminHeader from "@/components/admin/admin-header";
import Loading from "@/components/admin/loading";
import WrapperContainer from "@/components/admin/wrapper-container";
import CakeCard from "@/components/cakes/cake-card";
import iconConfig from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCurrentBranch from "@/hooks/useCurrentBranch";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICake } from "@/types/cake";
import { ICategory } from "@/types/category";
import { Input, Select, SelectItem, SharedSelection } from "@nextui-org/react";
import { useEffect, useState } from "react";

const BusinessProductsManagement = () => {
  const [listCakes, setListCakes] = useState<ICake[]>([]);
  const [listAllCakes, setListAllCakes] = useState<ICake[]>([]);
  const [metadata, setMetadata] = useState<IPaginationMetadata>();

  const staffAxios = useStaffAxios();
  const currentBranch = useCurrentBranch();
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [listCategories, setListCategories] = useState<ICategory[]>([]);

  const [currentCategoriesFilter, setCurrentCategoriesFilter] = useState<string[]>();

  const getBranchCakes = () => {
    if (currentBranch) {
      staffAxios
        .get<IAPIResponse<ICake[]>>(apiRoutes.branches.getBusinessProducts(currentBranch))
        .then((response) => response.data)
        .then((response) => {
          setIsFetching(false);
          setListCakes(response.results);
          setListAllCakes(response.results);
          setMetadata(response.metadata);
        })
        .finally(() => setIsFetching(false));
    }
  };

  const getAllCategories = () => {
    staffAxios
      .get<IAPIResponse<ICategory[]>>(apiRoutes.categories.getAll, {
        params: {
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        setListCategories(response.results);
      });
  };

  const handleSearch = (searchString: string) => {
    if (searchString === "") {
      setListCakes(listAllCakes);
      return;
    }
    const filtered = listAllCakes.filter((cake) =>
      cake.cakeName.toLowerCase().includes(searchString.toLowerCase()),
    );
    setListCakes(filtered);
  };

  const handleSet = (e: SharedSelection) => {
    const reMapArray = Array.from(e);

    setCurrentCategoriesFilter(reMapArray as string[]);
    if (reMapArray.length === 0) {
      return setListCakes(listAllCakes);
    }

    const filtered = listAllCakes.filter((cake) => reMapArray.includes(cake.cakeCategory));
    setListCakes(filtered);
  };

  useEffect(() => {
    Promise.all([getBranchCakes(), getAllCategories()]);
  }, []);

  return (
    <WrapperContainer>
      <AdminHeader title={currentBranch ? "Quản lí sản phẩm chi nhánh" : "Quản lí sản phẩm"} />
      <div className={"flex flex-col gap-8"}>
        <div className="flex justify-between">
          <Input
            size="lg"
            variant="bordered"
            className="max-w-80"
            endContent={<div className="text-default-300">{iconConfig.search.medium}</div>}
            onValueChange={handleSearch}
            placeholder="Nhập tên sản phẩm"
          />
          <div className="flex items-center gap-x-4">
            <div className={"flex items-center gap-2"}>
              <Select
                aria-label={"Select categories filter"}
                label={"Danh mục:"}
                labelPlacement={"outside-left"}
                className={"min-w-52"}
                selectedKeys={currentCategoriesFilter}
                onSelectionChange={handleSet}
                selectionMode={"multiple"}
                placeholder={"Tất cả"}
                classNames={{
                  label: "min-w-max text-base",
                  mainWrapper: "min-w-48",
                  base: "items-center",
                }}
              >
                {listCategories.map((category) => (
                  <SelectItem key={category.categoryKey.toString()} value={category.categoryKey.toString()}>
                    {category.categoryName}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className={"flex w-full flex-wrap justify-center"}>
          {isFetching ? (
            <Loading />
          ) : listCakes.length > 0 ? (
            listCakes.map((cake) => (
              <div className={"mx-2 my-4"} key={cake._id}>
                <CakeCard cakeData={cake} isShowUtils={false} />
              </div>
            ))
          ) : (
            <p className={"italic"}>Không có sản phẩm nào</p>
          )}
        </div>
      </div>
    </WrapperContainer>
  );
};

export default BusinessProductsManagement;
