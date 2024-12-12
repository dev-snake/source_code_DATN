import { ICakeProperty } from "@/types/cake";
interface ICakePropertiesProps {
  cakeProperties: ICakeProperty[];
}
const CakeProperties = ({ cakeProperties }: ICakePropertiesProps) => {
  return (
    <div className="rounded-2xl border p-4">
      <h4>Mô tả nhanh</h4>
      {cakeProperties.map((property, index) => (
        <div className="grid grid-cols-12 gap-4 py-2" key={index}>
          <span className="col-span-3 text-default-300">{property.propertyKey}</span>
          <span className="col-span-9">{property.propertyValue}</span>
        </div>
      ))}
    </div>
  );
};

export default CakeProperties;
