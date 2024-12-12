import textSizes from "@/config/styles/text-size";
interface IDescriptionProps {
  cakeDescription: string;
}
const Description = ({ cakeDescription }: IDescriptionProps) => (
  <div className="rounded-2xl border p-4">
    <h4>Mô tả sản phẩm</h4>
    <p className={`${textSizes.base} mt-4 text-justify`}>{cakeDescription}</p>
  </div>
);

export default Description;
