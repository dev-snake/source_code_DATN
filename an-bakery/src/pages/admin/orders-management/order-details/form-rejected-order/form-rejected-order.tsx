import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
} from "@nextui-org/react";

interface FormRejectedOrderProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  onConfirm: () => void;
  setRejectedReason: React.Dispatch<React.SetStateAction<string>>;
}

const FormRejectedOrder = ({
  isOpen,
  setRejectedReason,
  onOpenChange,
  onConfirm,
}: FormRejectedOrderProps) => {
  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h5>Xác nhận đơn hàng bị từ chối</h5>
              </ModalHeader>
              <ModalBody>
                <Textarea
                  size="lg"
                  label="Nhập lý do"
                  labelPlacement="outside"
                  classNames={{
                    label: "text-base",
                  }}
                  variant={"bordered"}
                  onValueChange={(value) => setRejectedReason(value)}
                  placeholder="Nhập lý do..."
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

export default FormRejectedOrder;
