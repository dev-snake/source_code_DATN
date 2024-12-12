import iconConfig from "@/config/icons/icon-config";
import { IBranch } from "@/types/branch";
import { ICake } from "@/types/cake";
import { ICustomerCartForm } from "@/types/cart";
import { formatCurrencyVND } from "@/utils/money-format";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
  RadioGroup,
  Radio,
  ModalFooter,
  ButtonGroup,
  Button,
} from "@nextui-org/react";
import clsx from "clsx";

interface ModalOrderOutsideProps {
  isOpen: boolean;
  onOpenChange: () => void;
  isLoading: boolean;
  listBranches: IBranch[];
  activeBorder: string | null;
  customerCartForm: ICustomerCartForm;
  setActiveBorder: React.Dispatch<React.SetStateAction<string | null>>;
  setBranchId: React.Dispatch<React.SetStateAction<string>>;
  setCustomerCartForm: React.Dispatch<React.SetStateAction<ICustomerCartForm>>;
  setCakeId: React.Dispatch<React.SetStateAction<string | null>>;
  cakeData: ICake;
  handleSelectVariant: (variantKey: string, itemKey: string) => void;
  handleAddToCart: () => void;
}

const ModalOrderOutside = ({
  isOpen,
  isLoading,
  activeBorder,
  cakeData,
  listBranches,
  customerCartForm,
  onOpenChange,
  setCakeId,
  setActiveBorder,
  setBranchId,
  setCustomerCartForm,
  handleAddToCart,
  handleSelectVariant,
}: ModalOrderOutsideProps) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="2xl">
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">Chọn chi nhánh có sẵn hàng</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-y-4">
              {isLoading ? (
                <Spinner label="Đang tải dữ liệu ..." />
              ) : listBranches.length === 0 ? (
                <p className="italic">
                  Hiện tại không có chi nhánh nào có sản phẩm này. Vui lòng chọn sản phẩm khác
                </p>
              ) : (
                listBranches.map((branch) => (
                  <div
                    key={branch._id}
                    className={clsx(
                      `flex items-center justify-between gap-2 rounded-lg border p-4 hover:cursor-pointer`,
                      {
                        "border-2 border-primary": activeBorder === branch._id,
                      },
                    )}
                    onClick={() => {
                      setActiveBorder(branch._id);
                      setBranchId(branch._id);
                      setCustomerCartForm({ ...customerCartForm, branchId: branch._id });
                      setCakeId(cakeData._id);
                    }}
                  >
                    <h6>{branch.branchConfig.branchDisplayName}</h6>
                  </div>
                ))
              )}
            </div>
            <div
              className={clsx({
                hidden: listBranches.length === 0,
              })}
            >
              <p className="text-sm italic">
                * Chú ý: Sản phẩm sẽ được thêm vào giỏ hàng của bạn sau khi xác nhận
              </p>
              <p className="text-sm italic">
                * Chú ý: Đồ kèm theo không bắt buộc, bạn có thể chọn hoặc không chọn
              </p>
              <hr className="my-2" />
              <div>
                <div className="flex items-center justify-between py-2">
                  <h6>Chọn đồ kèm theo</h6>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {cakeData.cakeVariants.map((cakeVariant, index) => (
                    <div key={index}>
                      <RadioGroup label={cakeVariant.variantLabel}>
                        {cakeVariant.variantItems.map((variantItem, index) => (
                          <Radio
                            key={index}
                            value={variantItem.itemLabel}
                            onChange={() =>
                              handleSelectVariant(cakeVariant._id as string, variantItem._id as string)
                            }
                          >
                            {variantItem.itemLabel} = (+{formatCurrencyVND(variantItem.itemPrice)})
                          </Radio>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <ButtonGroup isIconOnly variant="flat" isDisabled={listBranches.length === 0}>
              <Button
                onClick={() => {
                  if (customerCartForm.quantity > 1) {
                    setCustomerCartForm({ ...customerCartForm, quantity: customerCartForm.quantity - 1 });
                  }
                }}
              >
                {iconConfig.minus.small}
              </Button>
              <Button>{customerCartForm.quantity}</Button>
              <Button
                onClick={() => {
                  setCustomerCartForm({ ...customerCartForm, quantity: customerCartForm.quantity + 1 });
                }}
              >
                {iconConfig.add.small}
              </Button>
            </ButtonGroup>
            <Button color="primary" onPress={handleAddToCart}>
              Xác nhận
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

export default ModalOrderOutside;
