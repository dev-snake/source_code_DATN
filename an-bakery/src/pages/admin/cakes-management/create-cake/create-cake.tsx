import WrapperContainer from "@/components/admin/wrapper-container";
import AdminHeader from "@/components/admin/admin-header";
import CakeInfo from "../common/cake-info";
import Description from "../common/description";
import { Accordion, AccordionItem, Button, Image } from "@nextui-org/react";
import iconConfig from "@/config/icons/icon-config";
import VariantCakes from "../common/variant-cakes";
import { useState, useRef } from "react";
import adminRoutes from "@/config/routes/admin-routes.config";
import { ICake, ICakeProperty, ICakeBaseInfor, ICakeVariantForm } from "@/types/cake";
import CakeRecipe from "../common/cake-recipe";
import useStaffAxios from "@/hooks/useStaffAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IAPIResponse } from "@/types/api-response";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IRecipeVariant } from "@/types/recipe";
const UploadedFilesList = ({ files, onRemove }: { files: string[]; onRemove: (index: number) => void }) => {
  return (
    <div className="flex flex-col gap-y-1">
      {files.length > 0 ? (
        files.map((file, index) => (
          <div key={index} className="flex items-center justify-between">
            <Image src={file} className="h-20 w-20 rounded-lg object-cover" />
            <Button size="sm" color="danger" variant="ghost" isIconOnly onClick={() => onRemove(index)}>
              {iconConfig.delete.base}
            </Button>
          </div>
        ))
      ) : (
        <p className={"text-center italic"}>Chưa có hình ảnh nào được tải lên</p>
      )}
    </div>
  );
};

const CreateCake = () => {
  const ALLOWED_FILE_TYPES: string[] = ["image/jpeg", "image/png"];
  const MAX_FILE_SIZE: number = 5 * 1024 * 1024; // 5 MB
  const axiosStaff = useStaffAxios();
  const navigate = useNavigate();
  const [showVariants, setShowVariants] = useState<boolean>(false);
  const [recipeVariantList, setRecipeVariantList] = useState<IRecipeVariant[]>([
    {
      variantLabel: "",
      variantItems: [
        {
          itemLabel: "",
          materialId: "",
          quantity: 0,
        },
      ],
    },
  ]);
  const [cakeProperties, setCakeProperties] = useState<ICakeProperty[]>([
    {
      propertyKey: "",
      propertyValue: "",
    },
  ]);
  const [cakeInfo, setCakeInfo] = useState<Pick<ICake, keyof ICakeBaseInfor>>({
    cakeName: "",
    cakeCategory: "",
    cakeDescription: "",
    discountPercents: 0,
    cakeDefaultPrice: 0,
  });
  const [variantCakes, setVariantCakes] = useState<ICakeVariantForm[]>([
    {
      variantLabel: "",
      variantItems: [
        {
          itemLabel: "",
          itemPrice: 0,
          itemRecipe: "",
        },
      ],
    },
  ]);
  const [cakeRecipes, setCakeRecipes] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage(`Kiểu file không được phép  ${file.type}`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`Kích thước file vượt quá 5MB: ${file.name}`);
      return false;
    }
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (event.target.files) {
      const validFiles = Array.from(event.target.files).filter(validateFile);
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          if (reader.result) {
            setUploadedFiles((prevFiles) => [...prevFiles, reader.result as string]);
          }
        };
      });
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddCake = () => {
    const newCake: { [key: string]: unknown } = {
      ...cakeInfo,
      cakeProperties,
      cakeRecipe: cakeRecipes,
      cakeMedias: uploadedFiles,
      cakeThumbnail: uploadedFiles[0],
    };
    const { cakeCategory, cakeDefaultPrice, cakeDescription, cakeName, discountPercents } = cakeInfo;
    if (discountPercents < 0 || discountPercents > 100) {
      return toast.error("Phần trăm giảm giá không hợp lệ");
    }
    if (
      [cakeCategory, cakeDefaultPrice, cakeDescription, cakeName, uploadedFiles[0]].filter(Boolean).length !==
      5
    ) {
      return toast.error("Vui lòng điền đầy đủ thông tin");
    }
    const isHasCakeVariants = variantCakes.some((variant) => variant.variantLabel === "");
    if (!isHasCakeVariants) newCake["cakeVariants"] = variantCakes;
    axiosStaff
      .post<IAPIResponse>(apiRoutes.cakes.create, newCake)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          console.log("newCake", newCake);
          toast.success(response.message);
          navigate(adminRoutes.cakes.root);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <WrapperContainer>
      <AdminHeader title="Thêm sản phẩm mới" showBackButton={true} refBack={adminRoutes.cakes.root} />
      <div className="grid max-xl:gap-y-4 lg:gap-x-4 xl:grid-cols-2">
        <div className="flex flex-col gap-y-4">
          <CakeInfo
            cakeInfo={cakeInfo}
            setCakeInfo={setCakeInfo}
            showVariants={showVariants}
            setShowVariants={setShowVariants}
          />
          <CakeRecipe
            cakeRecipes={cakeRecipes}
            setCakeRecipes={setCakeRecipes}
            setRecipeVariantList={setRecipeVariantList}
          />
          <Button
            className="w-full"
            color="primary"
            size="lg"
            startContent={iconConfig.add.medium}
            onClick={handleAddCake}
          >
            Thêm mới sản phẩm
          </Button>
        </div>
        <div className="flex flex-col gap-y-4">
          <Accordion defaultExpandedKeys={["description"]} variant={"splitted"}>
            <AccordionItem key={"variants"} title={<h5>Tùy chỉnh biến thể bánh</h5>}>
              {showVariants ? (
                <VariantCakes
                  variantCakes={variantCakes}
                  setVariantCakes={setVariantCakes}
                  recipeVariantList={recipeVariantList}
                />
              ) : (
                <p>
                  Hãy chuyển sang kiểu <strong className={"text-primary"}>Bánh có biến thể</strong> để tùy
                  chỉnh biến thể bánh
                </p>
              )}
            </AccordionItem>
            <AccordionItem
              key={"images"}
              title={
                <div className="flex items-center justify-between">
                  <h5>Tải Ảnh/ Video sản phẩm</h5>
                  <Button
                    color="secondary"
                    startContent={iconConfig.uploadFile.medium}
                    onClick={handleUploadClick}
                  >
                    Tải hình ảnh lên
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>
              }
            >
              <div>
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}
                <UploadedFilesList files={uploadedFiles} onRemove={handleRemoveFile} />
              </div>
            </AccordionItem>
            <AccordionItem key={"description"} title={<h5>Mô tả sản phẩm</h5>}>
              <Description cakeProperties={cakeProperties} setCakeProperties={setCakeProperties} />
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </WrapperContainer>
  );
};

export default CreateCake;
