import textSizes from "@/config/styles/text-size";
import { FaStar } from "react-icons/fa";
import { iconSize } from "@/config/icons/icon-config";
import { Progress } from "@nextui-org/react";
import { Pagination } from "@nextui-org/react";
import { ICakeRate } from "@/types/cake";
import { formatDate } from "@/utils/format-date";
import { useMemo, useState } from "react";
import clsx from "clsx";
interface IFeedbacksProps {
  cakeRates: ICakeRate[];
  onOpenChange: () => void;
}
const Feedbacks = ({ cakeRates, onOpenChange }: IFeedbacksProps) => {
  const [page, setPage] = useState<number>(1);
  const rowsPerPage: number = 4;
  const pages = Math.ceil(cakeRates.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return cakeRates.slice(start, end);
  }, [page, cakeRates]);
  const [ratesStart] = useState({
    oneStar: cakeRates.filter((rate) => rate.rateStars === 1).length,
    twoStar: cakeRates.filter((rate) => rate.rateStars === 2).length,
    threeStar: cakeRates.filter((rate) => rate.rateStars === 3).length,
    fourStar: cakeRates.filter((rate) => rate.rateStars === 4).length,
    fiveStar: cakeRates.filter((rate) => rate.rateStars === 5).length,
  });
  const averageRating = cakeRates.reduce((sum, rate) => sum + rate.rateStars, 0) / cakeRates.length || 0;
  return (
    <div className="w-full rounded-2xl border py-2 max-lg:mt-2 max-lg:px-2 lg:px-4">
      <div className="flex items-center justify-between">
        <h4>Đánh giá từ khách hàng</h4>
        <span className="px-2 py-4 text-primary hover:cursor-pointer" onClick={onOpenChange}>
          Xem tất cả
        </span>
      </div>
      <div className="flex gap-x-4 max-sm:flex-col max-sm:gap-y-2">
        <div>
          <div className="flex items-end">
            <h1 className="text-8xl text-warning max-lg:text-7xl">{averageRating.toFixed(1)}</h1>
            <h1 className="text-3xl">/5</h1>
          </div>
          <div className="mt-2 flex gap-x-1">
            {Array.from({ length: averageRating }).map((_, index) => (
              <FaStar
                key={index}
                className={clsx({
                  "text-warning": index < averageRating,
                  "text-default-300": index >= averageRating,
                })}
                size={iconSize.small}
              />
            ))}
          </div>
          <p className="mt-2">Tổng {cakeRates.length} lượt đánh giá</p>
        </div>
        <div className="border max-xl:hidden"></div>
        {/* col2 feedback */}
        <div className="flex flex-col gap-y-3">
          {[
            { stars: 5, value: ratesStart.fiveStar },
            { stars: 4, value: ratesStart.fourStar },
            { stars: 3, value: ratesStart.threeStar },
            { stars: 2, value: ratesStart.twoStar },
            { stars: 1, value: ratesStart.oneStar },
          ].map((rate, index) => (
            <div className="flex items-center gap-x-2" key={index}>
              <div className="flex gap-x-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FaStar
                    key={index}
                    className={clsx({
                      "text-default-300": index >= rate.stars,
                      "text-warning": index < rate.stars,
                    })}
                    size={iconSize.medium}
                  />
                ))}
              </div>
              <Progress
                color="secondary"
                value={rate.value}
                size="md"
                className="w-[197px]"
                aria-label="process"
              />
              <span className="max-[1200px]:hidden max-lg:hidden max-sm:block">{rate.value}</span>
            </div>
          ))}
        </div>
      </div>
      {/* feedbacks information */}
      <div className="mt-4 flex flex-col gap-2">
        {/* items feedbacks */}
        {items.length !== 0 &&
          items.map((rate, index) => (
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
        <div className="flex justify-center">
          {cakeRates.length !== 0 && (
            <Pagination
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
              showControls
              showShadow
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedbacks;
