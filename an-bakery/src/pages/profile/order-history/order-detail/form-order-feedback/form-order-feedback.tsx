import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { ICakeRate } from "@/types/cake";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { BiStar, BiSolidStar } from "react-icons/bi";
import { useState } from "react";
interface FormOrderFeedbackProps {
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: () => void;
  onConfirm: () => void;
  setRates: React.Dispatch<React.SetStateAction<ICakeRate>>;
}

const FormOrderFeedback = ({ isOpen, onOpenChange, onConfirm, setRates }: FormOrderFeedbackProps) => {
  const [activeStar, setActiveStar] = useState<number>(5);
  const rates: number[] = [1, 2, 3, 4, 5];
  const handleRateStar = (star: number) => {};
  const showRateMessage = (rate: number) => {
    switch (rate) {
      case 1:
        return "Rất tệ";
      case 2:
        return "Tệ";
      case 3:
        return "Bình thường";
      case 4:
        return "Tốt";
      case 5:
        return "Rất tốt";
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top" size="xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex justify-center gap-4 p-4">
                {rates.map((rate, index) => (
                  <div
                    key={index}
                    className="cursor-pointer"
                    onClick={() => {
                      setActiveStar(rate);
                      handleRateStar(rate);
                      setRates((prev) => ({ ...prev, rateStars: rate }));
                    }}
                  >
                    {rate <= activeStar ? (
                      <BiSolidStar size={40} color="#f8c102" />
                    ) : (
                      <BiStar size={40} color="#f8c102" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-center text-lg">{showRateMessage(activeStar)}</p>
            </ModalHeader>
            <ModalBody>
              <Textarea
                size="lg"
                label="Nhập Nội dung đánh giá"
                labelPlacement="outside"
                placeholder="Nhập nội dung đánh giá của bạn"
                onChange={(e) => setRates((prev) => ({ ...prev, rateContent: e.target.value }))}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Hủy bỏ
              </Button>
              <Button color="warning" onPress={onConfirm}>
                Đánh giá
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default FormOrderFeedback;
