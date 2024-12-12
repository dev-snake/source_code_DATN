import { Image } from "@nextui-org/react";
import logo from "@/assets/images/logo.png";
import GoogleMap from "@/components/common/google-map";
import { IBranch } from "@/types/branch";
interface IBranchInfoSectionProps {
  listBranches: IBranch[];
}
const BranchInfoSection = ({ listBranches }: IBranchInfoSectionProps) => (
  <div>
    <div className="my-16 flex items-center justify-center gap-x-8 gap-y-4 text-center max-md:grid">
      <h1 className="text-8xl uppercase text-default-300 max-lg:text-7xl max-md:text-6xl max-sm:text-4xl">
        hệ thống
      </h1>
      <Image src={logo} alt="error" className="w-[470px] max-lg:max-w-96 max-md:max-w-80 max-sm:max-w-72" />
    </div>
    <div className="mx-auto grid grid-cols-2 gap-x-4 gap-y-4 max-lg:max-w-2xl max-lg:grid-cols-1 max-md:px-6">
      <div>
        {listBranches.map((branch, index) => (
          <div className="mb-2 rounded-lg border p-4" key={index}>
            <h6>
              Chi nhánh {index + 1} -{branch.branchConfig.branchDisplayName}
            </h6>
            <p className="mt-2 text-sm">{branch.branchConfig.branchAddress}</p>
          </div>
        ))}
      </div>
      <div>
        <GoogleMap />
      </div>
    </div>
  </div>
);

export default BranchInfoSection;
