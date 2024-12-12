import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@nextui-org/react";

interface FormCancelOrderProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  onConfirm: () => void;
  setCancelReason: React.Dispatch<React.SetStateAction<string>>;
}

const FormCancelOrder = ({ isOpen, setCancelReason, onOpenChange, onConfirm }: FormCancelOrderProps) => {
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h5 className="">Bạn có chắc chắn muốn hủy đơn hàng này không?</h5>
              </ModalHeader>
              <ModalBody>
                <Textarea
                  size="lg"
                  label="Nhập lý do hủy"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-base",
                  }}
                  variant={"bordered"}
                  onValueChange={(value) => setCancelReason(value)}
                  placeholder="Nhập lý do hủy của bạn"
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
    </>
  );
};

export default FormCancelOrder;
