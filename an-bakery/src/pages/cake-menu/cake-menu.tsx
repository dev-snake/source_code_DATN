import ProductCard from "@/components/cakes/cake-card";
import LoadingClient from "@/components/common/loading-client";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useAxios from "@/hooks/useAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { ICake } from "@/types/cake";
import { Pagination } from "@nextui-org/pagination";
import { Select, SelectItem, Spinner } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import SidebarFilter from "./sidebar-filter";
import { ICategory } from "@/types/category";
import listOfPrices from "./price-fillter";
import { IBranch } from "@/types/branch";
import { useSearchParams } from "react-router-dom";
import { AxiosError } from "axios";
import { IAPIResponseError } from "@/types/api-response-error";
import { toast } from "react-toastify";

interface ISelectedBranch {
  branchName: string | null;
  businessProducts?: string[];
  isActive?: boolean;
}
const ProductMenu = () => {
  const axiosClient = useAxios();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listProducts, setListProducts] = useState<ICake[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [listAllProducts, setListAllProducts] = useState<ICake[]>([]);
  const [listAllProductsCopy, setListAllProductsCopy] = useState<ICake[]>([]);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [listCategories, setListCategories] = useState<ICategory[]>([]);
  const [listBranches, setListBranches] = useState<IBranch[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedPriceWithBranch, setSelectedPriceWithBranch] = useState<string | null>(null);
  const [selectedCategoriesWithBranch, setSelectedCategoriesWithBranch] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<ISelectedBranch | null>(null);
  const [metaData, setMetaData] = useState<IPaginationMetadata | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const [filters, setFilters] = useState<{ [key: string]: string | number }>({
    page: Number(searchParams.get("page")) || 1,
    limit: 6,
    "cakeDefaultPrice[gte]": 0,
    sort: "cakeDefaultPrice",
    isHide: "false",
  });
  const rowsPerPage = 6;
  // const pages = Math.ceil(listProducts.length / rowsPerPage);

  const handleSort = (value: string) => {
    const sortValue = value === "asc" ? "cakeDefaultPrice" : "-cakeDefaultPrice";
    setFilters((prev) => ({ ...prev, sort: sortValue }));
  };
  const handlePageChange = (page: number) => {
    searchParams.set("page", String(page));
    setSearchParams(searchParams);
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };
  const handleFiltersChange = (newFilters: { [key: string]: string | number } | {}) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, ...newFilters };
      if (updatedFilters["cakeDefaultPrice[gte]"] === 0 && updatedFilters["cakeDefaultPrice[lte]"] === 0) {
        delete updatedFilters["cakeDefaultPrice[lte]"];
      }
      if (updatedFilters["cakeCategory"] === "") delete updatedFilters["cakeCategory"];
      return { ...updatedFilters, page: 1 };
    });
  };
  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategories((prev) => {
      let updatedCategories;
      if (prev.includes(categoryKey)) {
        updatedCategories = prev.filter((category) => category !== categoryKey);
      } else {
        updatedCategories = [...prev, categoryKey];
      }
      const newFilters = { cakeCategory: updatedCategories.join(",") };
      handleFiltersChange(newFilters);
      return updatedCategories;
    });
  };
  const handleChangePrice = (value: string) => {
    const [min, max] = value.split("-").map(Number);
    setSelectedPrice((prev) => {
      const newValue = prev === value ? null : value;
      const newFilters = newValue
        ? { "cakeDefaultPrice[gte]": min, "cakeDefaultPrice[lte]": max }
        : { "cakeDefaultPrice[gte]": 0, "cakeDefaultPrice[lte]": 0 };
      handleFiltersChange(newFilters);
      return newValue;
    });
  };
  // filter when select branch
  const handleSortWithBranch = (value: string) => {
    const sortedProducts = [...listAllProducts];
    if (value === "asc") {
      sortedProducts.sort((a, b) => a.cakeDefaultPrice - b.cakeDefaultPrice);
    } else {
      sortedProducts.sort((a, b) => b.cakeDefaultPrice - a.cakeDefaultPrice);
    }
    setListAllProducts(sortedProducts);
  };
  const listPages = useMemo(() => {
    const start = (pageNumber - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return listAllProducts.slice(start, end);
  }, [pageNumber, listAllProducts]);
  useEffect(() => {
    const pageFromURL = Number(searchParams.get("page")) || 1;
    setFilters((prev) => ({
      ...prev,
      page: pageFromURL,
    }));
  }, [searchParams]);

  useEffect(() => {
    let filteredProducts = listAllProductsCopy;

    if (selectedBranch) {
      filteredProducts = filteredProducts.filter((cake) =>
        selectedBranch.businessProducts?.includes(cake._id),
      );
      console.log("🚀 ~ useEffect ~ filteredProducts:", filteredProducts);
    }

    if (selectedPriceWithBranch) {
      const [min, max] = selectedPriceWithBranch.split("-").map(Number);
      filteredProducts = filteredProducts.filter(
        (cake) => cake.cakeDefaultPrice >= min && cake.cakeDefaultPrice <= max,
      );
    }

    if (selectedCategoriesWithBranch.length > 0) {
      filteredProducts = filteredProducts.filter((cake) =>
        selectedCategoriesWithBranch.includes(cake.cakeCategory),
      );
    }

    console.log(filteredProducts);
    setListAllProducts(filteredProducts);
  }, [selectedCategoriesWithBranch, selectedPriceWithBranch, selectedBranch]);

  // filter  when not select branch
  useEffect(() => {
    let isCancelled = false;

    setIsFiltering(true);
    Promise.all([
      axiosClient.get<IAPIResponse<ICategory[]>>(apiRoutes.categories.getAll),
      axiosClient.get<IAPIResponse<ICake[]>>(apiRoutes.cakes.getAll, { params: filters }),
      axiosClient.get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll),
    ])
      .then(([categoriesResponse, productsResponse, branchesResponse]) => {
        if (isCancelled) return;
        searchParams.set("page", String(filters.page));
        setSearchParams(searchParams);
        setListCategories(categoriesResponse.data.results.filter((x) => x.isActive));
        setListProducts(productsResponse.data.results);
        setListBranches(branchesResponse.data.results.filter((x) => x.isActive));
        setMetaData(productsResponse.data.metadata as IPaginationMetadata);
      })
      .catch((error) => {
        if (isCancelled) return;
        if (error instanceof AxiosError) {
          const responseError = error.response?.data as IAPIResponseError;
          if (responseError.message === "Trang không tồn tại, dữ liệu bạn yêu cầu chỉ có 2 trang") {
            handlePageChange(1);
            return toast.error("Bạn không thể xem một trang không tồn tại");
          }
        }
        setListProducts([]);
        setMetaData(null);
      })
      .finally(() => {
        if (isCancelled) return;
        setIsFiltering(false);
        setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  // useEffect(() => {
  //   setIsFiltering(true);
  //   Promise.all([
  //     axiosClient.get<IAPIResponse<ICategory[]>>(apiRoutes.categories.getAll),
  //     axiosClient.get<IAPIResponse<ICake[]>>(apiRoutes.cakes.getAll, {
  //       params: {
  //         ...filters,
  //       },
  //     }),
  //     axiosClient.get<IAPIResponse<IBranch[]>>(apiRoutes.branches.getAll),
  //   ])
  //     .then(([categoriesResponse, productsResponse, branchesResponse]) => {
  //       setListCategories(categoriesResponse.data.results.filter((x) => x.isActive));
  //       setListProducts(productsResponse.data.results);
  //       setListBranches(branchesResponse.data.results.filter((x) => x.isActive));
  //       setMetaData(productsResponse.data.metadata as IPaginationMetadata);
  //     })
  //     .catch((error) => {
  //       if (error instanceof AxiosError) {
  //         const responseError = error.response?.data as IAPIResponseError;
  //         if (responseError.message === "Trang không tồn tại, dữ liệu bạn yêu cầu chỉ có 2 trang") {
  //           handlePageChange(1);
  //           return toast.error("Bạn không thể xem một trang không tồn tại");
  //         }
  //       }
  //       setListProducts([]);
  //       setMetaData(null);
  //     })
  //     .finally(() => {
  //       setIsFiltering(false);
  //       return setIsLoading(false);
  //     });
  // }, [filters]);

  useEffect(() => {
    axiosClient
      .get<IAPIResponse<ICake[]>>(apiRoutes.cakes.getAll + "?noPagination=true")
      .then((response) => response.data)
      .then((data) => {
        setListAllProducts(data.results);
        setListAllProductsCopy(data.results);
      })
      .catch((error) => console.error(error));
  }, []);
  if (isLoading) return <LoadingClient />;

  return (
    <section>
      <div className="mx-auto mt-8 max-w-7xl grid-cols-12 gap-9 max-lg:px-4 max-lg:py-2 lg:grid">
        <SidebarFilter
          onFiltersChange={handleFiltersChange}
          listCategories={listCategories}
          listBranches={listBranches}
          selectedBranch={selectedBranch}
          selectedCategoriesWithBranch={selectedCategoriesWithBranch}
          selectedPriceWithBranch={selectedPriceWithBranch}
          setSelectedBranch={setSelectedBranch}
          setSelectedCategoriesWithBranch={setSelectedCategoriesWithBranch}
          setSelectedPriceWithBranch={setSelectedPriceWithBranch}
        />
        <div className="pb-4 lg:hidden">
          <div>
            <h5 className="mb-4">Chọn theo tiêu chí</h5>
            <div className="flex gap-2">
              <Select placeholder="Chọn danh mục " selectionMode="multiple" aria-label="Chọn danh mục">
                {listCategories.map((category) => (
                  <SelectItem
                    key={category.categoryKey}
                    onClick={() => handleCategoryChange(category.categoryKey)}
                  >
                    {category.categoryName}
                  </SelectItem>
                ))}
              </Select>
              <Select placeholder="Chọn khoảng giá" aria-label="Chọn khoảng giá">
                {listOfPrices.map((price) => (
                  <SelectItem key={price.value} onClick={() => handleChangePrice(price.value)}>
                    {price.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="col-span-9 flex w-full flex-col gap-6">
          <div className="flex items-center max-md:justify-end md:justify-between">
            <div className="max-md:hidden">
              <p>
                Đang hiển thị{" "}
                <strong>{selectedBranch ? pageNumber : (metaData?.currentPage as number)}</strong> trong số{" "}
                <strong>
                  {selectedBranch
                    ? Math.ceil(listAllProducts.length / rowsPerPage)
                    : (metaData?.totalPages as number)}
                </strong>{" "}
                kết quả phù hợp
              </p>
            </div>
            <div className="flex min-w-max items-center justify-between gap-4">
              {listProducts.length !== 0 && (
                <div className={"min-w-max"}>
                  <Pagination
                    showControls
                    showShadow
                    size="sm"
                    total={
                      selectedBranch
                        ? Math.ceil(listAllProducts.length / rowsPerPage)
                        : (metaData?.totalPages as number)
                    }
                    page={metaData?.currentPage}
                    onChange={
                      selectedBranch ? (page) => setPageNumber(page) : (page) => handlePageChange(page)
                    }
                  />
                </div>
              )}
              <Select
                variant="bordered"
                className="w-[170px]"
                aria-label="filter"
                placeholder="Bộ lọc"
                onSelectionChange={(e) => {
                  if (selectedBranch) {
                    handleSortWithBranch(Array.from(e).join(""));
                  } else {
                    handleSort(Array.from(e).join(""));
                  }
                }}
              >
                <SelectItem key={"asc"}>Giá tăng dần</SelectItem>
                <SelectItem key={"desc"}>Giá giảm dần</SelectItem>
              </Select>
            </div>
          </div>
          {/* product items */}
          <div className="grid gap-x-4 gap-y-8 max-md:grid-cols-2 max-[480px]:grid-cols-1 md:grid-cols-3">
            {isFiltering ? (
              <Spinner label="Đang lọc sản phẩm" className="relative z-50 col-span-3 mx-auto" />
            ) : (selectedBranch ? listAllProducts : listProducts).length === 0 ? (
              <p className="col-span-3 mx-auto italic">Không có sản phẩm nào phù hợp</p>
            ) : (
              (selectedBranch ? listPages : listProducts).map((cake) => (
                <ProductCard cakeData={cake} key={cake._id} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductMenu;
