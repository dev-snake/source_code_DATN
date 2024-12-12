import { iconSize } from "@/config/icons/icon-config";
import textSizes from "@/config/styles/text-size";
import { ICakeRate } from "@/types/cake";
import { formatDate } from "@/utils/format-date";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import clsx from "clsx";
import { FaStar } from "react-icons/fa";

interface ModelFeedBacksProps {
  isOpen: boolean;
  onOpenChange: () => void;
  cakeRates: ICakeRate[];
}

const ModelFeedBacks = ({ isOpen, onOpenChange, cakeRates }: ModelFeedBacksProps) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Tất cả những đánh giá</ModalHeader>
            <ModalBody>
              <div className="w-scrollbar flex max-h-96 scroll-pb-1 flex-col gap-y-2 overflow-y-scroll p-2">
                {cakeRates.map((rate, index) => (
                  <div className="rounded-lg border p-4" key={index}>
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <div className="size-[50px] rounded-full bg-default-300"></div>
                        <div>
                          <p className={`${textSizes.base} font-bold`}>Ẩn danh</p>
                          <span className={`${textSizes.sm} text-default-300`}>
                            {formatDate(rate.createdAt as string)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-x-1">
                        {Array.from({ length: rate.rateStars }).map((_, index) => (
                          <FaStar
                            key={index}
                            className={clsx({
                              "text-warning": index < rate.rateStars,
                              "text-default-300": index >= rate.rateStars,
                            })}
                            size={iconSize.small}
                          />
                        ))}
                      </div>
                    </div>
                    <p className={`${textSizes.sm} mt-2 text-justify`}>{rate.rateContent}</p>
                  </div>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Đóng
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ModelFeedBacks;
