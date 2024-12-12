import React from "react";
interface IPropChild {
  children: React.ReactNode;
}
const WrapperContainer = ({ children }: IPropChild) => (
  <main className="col-span-10 p-4 max-xl:col-span-11">{children}</main>
);

export default WrapperContainer;
