import { Modal, ModalContent, ModalFooter, ModalHeader, Button, ModalBody } from "@nextui-org/react";

interface ModalConfirmDeleteProps {
  name: string;
  customContent?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ModalConfirmDelete = ({ isOpen, onClose, onConfirm, name, customContent }: ModalConfirmDeleteProps) => (
  <Modal isOpen={isOpen} onOpenChange={onClose}>
    <ModalContent>
      <>
        <ModalHeader className="flex flex-col gap-1">Xóa {name}?</ModalHeader>
        <ModalBody>{customContent ? customContent : <p>Bạn có chắc muốn xóa {name} này?</p>}</ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Hủy bỏ
          </Button>
          <Button color="primary" onPress={onConfirm}>
            Xác nhận
          </Button>
        </ModalFooter>
      </>
    </ModalContent>
  </Modal>
);

export default ModalConfirmDelete;
