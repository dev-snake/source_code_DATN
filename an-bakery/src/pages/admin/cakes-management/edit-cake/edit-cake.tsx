import AdminHeader from "@/components/admin/admin-header";
import WrapperContainer from "@/components/admin/wrapper-container";
import iconConfig from "@/config/icons/icon-config";
import adminRoutes from "@/config/routes/admin-routes.config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useAxios from "@/hooks/useAxios";
import useStaffAxios from "@/hooks/useStaffAxios";
import { IAPIResponse } from "@/types/api-response";
import { ICake, ICakeBaseInfor, ICakeDetail, ICakeProperty, ICakeVariant } from "@/types/cake";
import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import CakeRecipe from "../common/cake-recipe";
import Description from "../common/description";
import CakeInfo from "../common/cake-info";
import VariantCakes from "../common/variant-cakes";
import { IRecipeVariant } from "@/types/recipe";
import { displayImage } from "@/utils/display-image";
interface IUploadFilesList {
  files: string[];
  onRemove: (index: number) => void;
  onEdit: (index: number, file: File) => void;
}
const UploadedFilesList = ({ files, onRemove, onEdit }: IUploadFilesList) => {
  const { cakeId } = useParams();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleEditClick = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (event.target.files && event.target.files[0]) {
      onEdit(index, event.target.files[0]);
    }
  };
  return (
    <div className="flex flex-col gap-y-1">
      {files.map((file, index) => (
        <div key={index} className="flex items-center justify-between">
          <img
            src={file.startsWith("data:image") ? file : displayImage(file, cakeId as string)}
            className="h-20 w-20 rounded-lg object-cover"
          />
          <div className="flex gap-x-2">
            <Button
              size="sm"
              color="warning"
              variant="ghost"
              isIconOnly
              onClick={() => handleEditClick(index)}
            >
              {iconConfig.edit.base}
            </Button>
            <Button size="sm" color="danger" isIconOnly variant="ghost" onClick={() => onRemove(index)}>
              {iconConfig.delete.base}
            </Button>
            <input
              type="file"
              ref={(el) => (fileInputRefs.current[index] = el)}
              className="hidden"
              onChange={(event) => handleFileChange(event, index)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
const EditCake = () => {
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png"];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const axiosStaff = useStaffAxios();
  const axiosClient = useAxios();
  const navigate = useNavigate();
  const { cakeId } = useParams();

  const [cakeProperties, setCakeProperties] = useState<ICakeProperty[]>([
    {
      propertyKey: "",
      propertyValue: "",
    },
  ]);
  const [cakeInfo, setCakeInfo] = useState<ICakeBaseInfor>({
    cakeName: "",
    cakeCategory: "",
    cakeDescription: "",
    discountPercents: 0,
    cakeDefaultPrice: 0,
  });
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
  const [variantCakes, setVariantCakes] = useState<ICakeVariant[]>([
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
  const variantCakesRef = useRef<ICakeVariant[] | []>([]);
  const cakeRecipeRef = useRef<string | null>(null);
  const [cakeRecipes, setCakeRecipes] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    axiosClient
      .get<IAPIResponse<ICakeDetail>>(apiRoutes.cakes.getOne(cakeId as string))
      .then((response) => response.data)
      .then((response) => {
        const { cakeName, cakeCategory, cakeDescription, discountPercents, cakeDefaultPrice } =
          response.results.cakeInfo;
        setCakeInfo({
          cakeName,
          cakeCategory,
          cakeDescription,
          discountPercents,
          cakeDefaultPrice,
        });

        // console.log("response.results", response.results);

        setCakeRecipes(response.results.cakeRecipe._id as string);
        cakeRecipeRef.current = response.results.cakeRecipe._id as string;
        setCakeProperties(response.results.cakeProperties);
        setVariantCakes(response.results.cakeVariants);
        variantCakesRef.current = response.results.cakeVariants;
        setRecipeVariantList(response.results.cakeRecipe.recipeVariants as IRecipeVariant[]);
        setUploadedFiles(response.results.cakeMedias);
        setShowVariants(response.results.cakeVariants.length !== 0);
      })
      .catch((error) => console.log(error));
  }, []);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setErrorMessage(`Kiểu file không được phép ${file.type}`);
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
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  const handleEditImageFile = (index: number, file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      if (reader.result) {
        setUploadedFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          newFiles[index] = reader.result as string;
          return newFiles;
        });
      }
    };
  };
  console.log("uploadedFiles", uploadedFiles);

  const handleEditCake = () => {
    const newCake: { [key: string]: unknown } = {
      ...cakeInfo,
      cakeProperties,
      cakeRecipe: cakeRecipes,
      cakeMedias: uploadedFiles,
      cakeThumbnail: uploadedFiles[0],
      cakeVariants : variantCakes
    };
    const isHasVariants =
      variantCakes.some((variant) => variant.variantLabel === "") || variantCakes.length === 0;
    if (!isHasVariants) newCake["cakeVariants"] = variantCakes;
    axiosStaff
      .patch<IAPIResponse<ICake>>(apiRoutes.cakes.edit(cakeId as string), newCake)
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          console.log("newCake", newCake);
          // console.log("cakeVariants", variantCakes);
          toast.success(response.message);
          navigate(adminRoutes.cakes.root);
        }
      })
      .catch((error) => console.log(error));
  };
  const handleChangeCakeVariants = (recipeId: string) => {
    if (recipeId !== cakeRecipeRef.current) {
      setVariantCakes([
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
    } else {
      setVariantCakes(variantCakesRef.current);
    }
  };
  console.log("variantCakes", variantCakes);
  return (
    <WrapperContainer>
      <AdminHeader title="Cập nhật sản phẩm mới" showBackButton={true} refBack={adminRoutes.cakes.root} />
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
            onChangeRecipe={handleChangeCakeVariants}
          />

          <Button
            className="w-full"
            color="primary"
            size="lg"
            startContent={iconConfig.edit.medium}
            onClick={handleEditCake}
          >
            Cập nhật sản phẩm
          </Button>
        </div>
        <div className="flex flex-col gap-y-4">
          <Accordion variant={"splitted"} defaultExpandedKeys={[showVariants ? "variants" : "description"]}>
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
                <UploadedFilesList
                  files={uploadedFiles}
                  onRemove={handleRemoveFile}
                  onEdit={handleEditImageFile}
                />
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

export default EditCake;
