import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

interface FormConfirmBuyAgaintOrderProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  onConfirm: () => void;
}

const FormConfirmBuyAgaintOrder = ({ isOpen, onOpenChange, onConfirm }: FormConfirmBuyAgaintOrderProps) => (
  <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl" placement="top">
    <ModalContent>
      {(onClose) => (
        <>
          <ModalHeader className="flex flex-col gap-1">
            <h5 className="">Bạn có chắc chắn muốn mua lại đơn hàng này không?</h5>
          </ModalHeader>
          <ModalBody></ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Hủy bỏ
            </Button>
            <Button color="primary" onPress={onConfirm}>
              Xác nhận
            </Button>
          </ModalFooter>
        </>
      )}
    </ModalContent>
  </Modal>
);

export default FormConfirmBuyAgaintOrder;
