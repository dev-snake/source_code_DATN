// import { IUserAddresses } from "@/types/customer";
// import { IOrderGroup } from "@/types/order";

// interface ISelectedAddressProps {
//   selectedAddressId: string | null;
//   listAddressOfCustomer: IUserAddresses[];
//   setOrderGroup: React.Dispatch<React.SetStateAction<IOrderGroup>>;
//   onClose: () => void;
// }
// const selectAddressHandler = ({
//   listAddressOfCustomer,
//   setOrderGroup,
//   selectedAddressId,
//   onClose,
// }: ISelectedAddressProps) => {
//   console.log("selectedAddressId", selectedAddressId);
//   const selectedAddress = listAddressOfCustomer.find((address) => address._id === selectedAddressId);
//   console.log("selectedAddress", selectedAddress);
//   setOrderGroup((prev) => ({
//     ...prev,
//     customerInfo: {
//       email: selectedAddress?.email || "",
//       fullAddress: selectedAddress?.fullAddress || "",
//       fullName: selectedAddress?.fullName || "",
//       phoneNumber: selectedAddress?.phoneNumber || "",
//     },
//   }));
//   onClose();
// };
// export default selectAddressHandler;
