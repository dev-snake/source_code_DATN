import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@nextui-org/react";

interface FormReturnOrderProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  onConfirm: () => void;
  setOrderReturn: React.Dispatch<React.SetStateAction<string>>;
}

const FormReturnOrder = ({
  isOpen,
  onConfirm,
  onOpenChange,
  onOpen,
  setOrderReturn,
}: FormReturnOrderProps) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="xl">
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">
            <h5 className="">Bạn có chắc chắn muốn trả hàng không?</h5>
          </ModalHeader>
          <ModalBody>
            <Textarea
              size="lg"
              label="Nhập lý do trả hàng"
              labelPlacement="outside"
              classNames={{
                label: "text-base",
              }}
              variant={"bordered"}
              onValueChange={(value) => setOrderReturn(value)}
              placeholder="Nhập lý do trả hàng của bạn"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Hủy bỏ
            </Button>
            <Button color="danger" onPress={onConfirm}>
              Xác nhận
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

FormReturnOrder.defaultProps = {
  foo: "bar",
};

export default FormReturnOrder;
