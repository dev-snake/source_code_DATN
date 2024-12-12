import CakeCard from "@/components/cakes/cake-card";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import settings from "@/libs/Carousel";
import { useState, useEffect, Fragment } from "react";
import { ICake } from "@/types/cake";
import useAxios from "@/hooks/useAxios";
import { apiRoutes } from "@/config/routes/api-routes.config";
import { IAPIResponse } from "@/types/api-response";
interface SimilarProductsProps {
  cakeId: string;
}
const SimilarProducts = ({ cakeId }: SimilarProductsProps) => {
  const axiosClient = useAxios();
  const [similarCakes, setSimilarCakes] = useState<ICake[]>([]);
  useEffect(() => {
    axiosClient
      .get<IAPIResponse<ICake[]>>(apiRoutes.cakes.getAll, {
        params: {
          noPagination: true,
        },
      })
      .then((response) => response.data)
      .then((response) => {
        const originalCake = response.results.find((cake) => cake._id.toString() === cakeId);
        if (!originalCake) return;
        const similarCakes = response.results.filter(
          (cake) =>
            cake.cakeCategory === originalCake.cakeCategory &&
            cake._id.toString() !== originalCake._id.toString(),
        );
        setSimilarCakes(similarCakes);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <div className="max-w-full overflow-hidden">
      <h1 className="mb-8 mt-20 text-center text-default-300 max-md:text-6xl max-sm:text-3xl">
        CÁC MẪU BÁNH CÙNG LOẠI
      </h1>
      <Slider {...settings}>
        {similarCakes.map((cake) => (
          <Fragment key={cake._id}>
            <CakeCard cakeData={cake} />
          </Fragment>
        ))}
      </Slider>
    </div>
  );
};

export default SimilarProducts;
