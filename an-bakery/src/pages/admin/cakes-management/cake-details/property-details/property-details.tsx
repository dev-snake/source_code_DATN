import { ICakeProperty } from "@/types/cake";

interface PropertyDetailsProps {
  cakeProperties: ICakeProperty[];
}

const PropertyDetails = ({ cakeProperties }: PropertyDetailsProps) => (
  <div className="mt-4 rounded-2xl border p-4">
    <h5 className="mb-4">Mô tả nhanh</h5>
    <div className="flex flex-col gap-y-2">
      {cakeProperties.map((property, index) => (
        <div className="flex items-center" key={index}>
          <span className="text-default-300">{property.propertyKey}</span>
          <span className="ml-auto self-end">{property.propertyValue}</span>
        </div>
      ))}
    </div>
  </div>
);

export default PropertyDetails;
