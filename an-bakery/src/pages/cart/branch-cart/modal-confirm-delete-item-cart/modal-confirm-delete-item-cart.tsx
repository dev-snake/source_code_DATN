import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";

interface ModalConfirmDeleteItemCartProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  onConfirmDelete: () => void;
}

const ModalConfirmDeleteItemCart = ({
  isOpen,
  onOpenChange,
  onConfirmDelete,
}: ModalConfirmDeleteItemCartProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h4 className="text-lg font-bold">Xác nhận xóa sản phẩm</h4>
              <p className="text-sm text-default-300">
                Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?
              </p>
            </ModalHeader>

            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Không xóa
              </Button>
              <Button color="primary" onPress={onConfirmDelete}>
                Đồng ý xóa
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModalConfirmDeleteItemCart;
