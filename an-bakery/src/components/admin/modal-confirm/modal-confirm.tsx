import { Modal, ModalContent, ModalFooter, ModalHeader, Button } from "@nextui-org/react";
interface ModalConfirmProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  color?: "danger" | "success" | "primary" | "warning" | "default";
  confirmMessage?: string;
}
const ModalConfirm = ({
  message,
  isOpen,
  onClose,
  onConfirm,
  color = "danger",
  confirmMessage = "Xác nhận",
}: ModalConfirmProps) => (
  <Modal isOpen={isOpen} onOpenChange={onClose} size="2xl" placement="top">
    <ModalContent>
      <>
        <ModalHeader className="flex flex-col gap-1">{message}</ModalHeader>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Hủy bỏ
          </Button>
          <Button color={color} onPress={onConfirm}>
            {confirmMessage}
          </Button>
        </ModalFooter>
      </>
    </ModalContent>
  </Modal>
);

export default ModalConfirm;
