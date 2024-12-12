import LoadingClient from "@/components/common/loading-client";
import iconConfig, { iconSize } from "@/config/icons/icon-config";
import { apiRoutes } from "@/config/routes/api-routes.config";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse, IPaginationMetadata } from "@/types/api-response";
import { IFeedback, IFeedbackHistory } from "@/types/customer";
import { displayImage } from "@/utils/display-image";
import { formatDate } from "@/utils/format-date";
import { slugify } from "@/utils/slugify";
import ModalConfirm from "@/components/admin/modal-confirm";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Image,
  Pagination,
  ScrollShadow,
  useDisclosure,
} from "@nextui-org/react";
import { Key, useEffect, useState } from "react";
import { FaAlignLeft, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

const FeedbackHistory = () => {
  const customerAxios = useCustomerAxios();
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(["old"]));
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedFeedback, setSelectedFeedback] = useState<{ cakeId: string; rateId: string }>({
    cakeId: "",
    rateId: "",
  });

  const [customerFeedbacks, setCustomerFeedbacks] = useState<IFeedbackHistory[]>();
  const [metadata, setMetadata] = useState<IPaginationMetadata>();

  const getCustomerFeedbacks = () => {
    customerAxios
      .get<IAPIResponse<IFeedbackHistory[]>>(apiRoutes.customers.me.feedbacks)
      .then((response) => response.data)
      .then((response) => {
        setCustomerFeedbacks(response.results);
        setMetadata(response.metadata);
      })
      .catch((error) => console.log(error));
  };
  const sortFeedbacks = (key: Key) => {
    if (!customerFeedbacks) return;

    setSelectedKeys(new Set([key as string]));

    const sortedFeedbacks = customerFeedbacks.map((feedbackItem) => {
      const sorted = [...feedbackItem.feedbacks].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        return key === "new" ? dateB - dateA : dateA - dateB;
      });

      return { ...feedbackItem, feedbacks: sorted };
    });

    setCustomerFeedbacks(sortedFeedbacks);
  };
  console.log(customerFeedbacks, "customerFeedbacks");
  const handleDeleteFeedback = async (cakeId: string, rateId: string) => {
    try {
      const res = await customerAxios.patch<IAPIResponse<IFeedback>>(
        apiRoutes.customers.me.deleteFeedback(cakeId),
        {
          rateId,
          isDeleted: true,
        },
      );
      if (res.data.status === "success") {
        toast.success(res.data.message);
        setSelectedFeedback({
          cakeId: "",
          rateId: "",
        });
        setCustomerFeedbacks(
          customerFeedbacks?.map((feedbackItem) => {
            if (feedbackItem.cakeInfo.cakeId === cakeId) {
              return {
                ...feedbackItem,
                feedbacks: feedbackItem.feedbacks.map((feedback: { _id: string }) => {
                  if (feedback._id === rateId) {
                    return { ...feedback, isDeleted: true };
                  }
                  return feedback;
                }),
              };
            }
            return feedbackItem;
          }),
        );
        onOpenChange();
        getCustomerFeedbacks();
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCustomerFeedbacks();
  }, []);

  if (!customerFeedbacks) return <LoadingClient />;
  console.log(selectedFeedback);
  return (
    <div className="flex flex-col gap-2">
      <ModalConfirm
        message="Bạn có chắc chắn muốn xóa đánh giá này không ?"
        isOpen={isOpen}
        onClose={() => {
          setSelectedFeedback({
            cakeId: "",
            rateId: "",
          });
          onOpenChange();
        }}
        onConfirm={() => handleDeleteFeedback(selectedFeedback.cakeId, selectedFeedback.rateId)}
      />
      <ScrollShadow
        hideScrollBar={true}
        className="w-scrollbar scrollbar-track flex h-[650px] max-h-[650px] flex-col gap-4 rounded-2xl border p-4"
      >
        <div className="flex">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" size="md" startContent={<FaAlignLeft size={iconSize.base} />}>
                Bộ Lọc
              </Button>
              {/* <Button variant="bordered">Open Menu</Button> */}
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Dynamic Actions"
              onAction={(key) => sortFeedbacks(key as string)}
              selectedKeys={selectedKeys}
              selectionMode="single"
            >
              <DropdownItem key="new">Gần Nhất</DropdownItem>
              <DropdownItem key="old">Lâu nhất</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className={"flex flex-col gap-2"}>
          {customerFeedbacks.flatMap((feedbackItem) =>
            (feedbackItem.feedbacks as IFeedback[]).filter((item) => !item.isDeleted).length > 0 ? (
              customerFeedbacks.flatMap((feedbackItem) =>
                (feedbackItem.feedbacks as IFeedback[])
                  .filter((item) => !item.isDeleted)
                  .map((feedback) => (
                    <div key={feedback._id} className="flex gap-x-4 rounded-lg border p-3">
                      <div>
                        <Image
                          src={
                            feedbackItem.cakeInfo.cakeThumbnail
                              ? displayImage(
                                  feedbackItem.cakeInfo.cakeThumbnail,
                                  feedbackItem.cakeInfo.cakeId,
                                )
                              : "https://placehold.co/400"
                          }
                          width={60}
                          height={60}
                          alt={slugify(feedbackItem.cakeInfo.cakeName)}
                          className="object-contain"
                        />
                      </div>
                      <div className="flex flex-grow justify-between">
                        <div>
                          <p className="text-sm font-semibold">{feedbackItem.cakeInfo.cakeName}</p>
                          <p className="mt-1 text-xs">{feedback.rateContent}</p>
                          <div className="flex gap-x-1">
                            {Array.from({ length: feedback.rateStars }).map((_, starIndex) => (
                              <FaStar className="text-warning" key={starIndex} />
                            ))}
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col items-end justify-between text-xs text-default-300">
                          <span>{formatDate(feedback.createdAt as string, "fullDate")}</span>
                          <Button
                            size="sm"
                            isIconOnly
                            color="danger"
                            variant="light"
                            onClick={() =>
                              // handleDeleteFeedback(feedbackItem.cakeInfo.cakeId, feedback._id as string)
                              {
                                setSelectedFeedback({
                                  cakeId: feedbackItem.cakeInfo.cakeId,
                                  rateId: feedback._id as string,
                                });
                                onOpenChange();
                              }
                            }
                          >
                            {iconConfig.delete.base}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )),
              )
            ) : (
              <p className="italic">Lịch sử đánh giá trống</p>
            ),
          )}
        </div>
      </ScrollShadow>
      <div className="mt-2 flex justify-center">
        <Pagination total={metadata?.totalPages ?? 1} page={metadata?.currentPage} showShadow />
      </div>
    </div>
  );
};

export default FeedbackHistory;
