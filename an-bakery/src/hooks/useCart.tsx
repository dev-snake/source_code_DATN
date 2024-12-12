import { apiRoutes } from "@/config/routes/api-routes.config";
import useCustomerAxios from "@/hooks/useCustomerAxios";
import { IAPIResponse } from "@/types/api-response";
import { ICake, ICakeVariant } from "@/types/cake";
import { IUserCart, TSelectedVariant } from "@/types/cart";
import { calculateDiscountPrice, formatCurrencyVND } from "@/utils/money-format";
import { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

const useCart = () => {
  const axiosCustomer = useCustomerAxios();
  const [cartCustomer, setCartCustomer] = useState<IUserCart[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setCookie] = useCookies(["totalQuantity"]);

  const fetchCartCustomer = () => {
    axiosCustomer
      .get<IAPIResponse<IUserCart[]>>(apiRoutes.customers.me.cart)
      .then((response) => response.data)
      .then((response) => setCartCustomer(response.results))
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCartCustomer();
  }, []);

  const handleShowSelectedVariant = (selectedVariants: TSelectedVariant[], cakeVariants: ICakeVariant[]) => {
    const nameOfVariants: string[] = [];
    selectedVariants.map((variant) => {
      return cakeVariants.map((cakeVariant) => {
        if (cakeVariant._id === variant.variantKey) {
          return cakeVariant.variantItems.map((variantItem) => {
            if (variantItem._id === variant.itemKey) {
              nameOfVariants.push(variantItem.itemLabel);
            }
          });
        }
      });
    });
    return nameOfVariants.join(" - ");
  };

  const handlePrice = (
    priceDefault: number,
    selectedVariants: TSelectedVariant[],
    cakeVariants: ICakeVariant[],
    quantity: number,
  ) => {
    // console.log("quantity", quantity);
    let priceOfCake: number = priceDefault;
    // console.log("selectedVariants", selectedVariants);
    selectedVariants.map((variant) => {
      return cakeVariants.map((cakeVariant) => {
        if (cakeVariant._id === variant.variantKey) {
          return cakeVariant.variantItems.map((variantItem) => {
            if (variantItem._id === variant.itemKey) {
              priceOfCake += variantItem.itemPrice * quantity;
            }
          });
        }
      });
    });
    return formatCurrencyVND(priceOfCake);
  };

  const deleteCakeFromBranchCart = (
    branchId: string,
    cakeId: string,
    selectedVariants: TSelectedVariant[],
    cartId: string,
  ) => {
    axiosCustomer
      .post<IAPIResponse<ICake>>(apiRoutes.cart.deleteCakeFromCart, {
        branchId,
        cakeId,
        selectedVariants,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          toast.success("Xóa sản phẩm thành công");
          setCartCustomer((prev) =>
            prev
              .map((branchCart) =>
                branchCart.branchId === branchId
                  ? {
                      ...branchCart,
                      cartItems: branchCart.cartItems.filter((cake) => cake._id !== cartId),
                    }
                  : branchCart,
              )
              .filter((branchCart) => branchCart.cartItems.length > 0),
          );
        }
      })
      .catch((error) => console.log(error));
  };

  const handleIncreaseQuantity = (
    branchId: string,
    cakeId: string,
    selectedVariants: TSelectedVariant[],
    newQuantity: number,
    cartId: string,
  ) => {
    axiosCustomer
      .patch<IAPIResponse<IUserCart>>(apiRoutes.cart.changeQuantity, {
        branchId,
        cakeId,
        selectedVariants,
        newQuantity,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          console.log(response);
          setCartCustomer((prev) => {
            return prev.map((branchCart) => {
              if (branchCart.branchId === branchId) {
                return {
                  ...branchCart,
                  cartItems: branchCart.cartItems.map((cake) => {
                    if (cake.cakeId === cakeId && cake._id === cartId) {
                      return {
                        ...cake,
                        quantity: newQuantity,
                      };
                    }
                    return cake;
                  }),
                };
              }
              return branchCart;
            });
          });
        }
      })
      .catch((error) => console.log(error));
  };

  const totalQuantityCake = useMemo(() => {
    let total: number = 0;
    cartCustomer.map((branchCart) => {
      branchCart.cartItems.map((cake) => {
        total += cake.quantity;
      });
    });
    setCookie("totalQuantity", total, { path: "/" });
    return total;
  }, [cartCustomer]);

  const handleDecreaseQuantity = (
    branchId: string,
    cakeId: string,
    selectedVariants: TSelectedVariant[],
    newQuantity: number,
    cartId: string,
  ) => {
    if (newQuantity === 1) {
      return toast.error("Số lượng sản phẩm không thể nhỏ hơn 1");
    }
    newQuantity -= 1;
    axiosCustomer
      .patch<IAPIResponse<ICake>>(apiRoutes.cart.changeQuantity, {
        branchId,
        cakeId,
        selectedVariants,
        newQuantity,
      })
      .then((response) => response.data)
      .then((response) => {
        if (response.status === "success") {
          setCartCustomer((prev: IUserCart[]) =>
            prev.map((branchCart) => {
              if (branchCart.branchId === branchId) {
                return {
                  ...branchCart,
                  cartItems: branchCart.cartItems.map((cake) => {
                    if (cake.cakeId === cakeId && cake._id === cartId) {
                      return {
                        ...cake,
                        quantity: newQuantity,
                      };
                    }
                    return cake;
                  }),
                };
              }
              return branchCart;
            }),
          );
        }
      })
      .catch((error) => console.log(error));
  };

  const totalPayment = (): number => {
    let total: number = 0;
    cartCustomer.map((branchCart) => {
      return branchCart.cartItems.map((cake) => {
        total +=
          calculateDiscountPrice(cake.cakeInfo!.cakeDefaultPrice, cake.cakeInfo!.discountPercents) *
          cake.quantity;
        return cake.selectedVariants.map((variant) => {
          return cake.cakeInfo!.cakeVariants.map((cakeVariant) => {
            if (cakeVariant._id === variant.variantKey) {
              return cakeVariant.variantItems.map((variantItem) => {
                if (variantItem._id === variant.itemKey) {
                  total += variantItem.itemPrice * cake.quantity;
                }
              });
            }
          });
        });
      });
    });
    return total;
  };
  const totalBranch = (branchId: string): number => {
    let total: number = 0;
    cartCustomer.map((branchCart) => {
      if (branchCart.branchId === branchId) {
        return branchCart.cartItems.map((cake) => {
          total +=
            calculateDiscountPrice(cake.cakeInfo!.cakeDefaultPrice, cake.cakeInfo!.discountPercents) *
            cake.quantity;
          return cake.selectedVariants.map((variant) => {
            return cake.cakeInfo!.cakeVariants.map((cakeVariant) => {
              if (cakeVariant._id === variant.variantKey) {
                return cakeVariant.variantItems.map((variantItem) => {
                  if (variantItem._id === variant.itemKey) {
                    total += variantItem.itemPrice * cake.quantity;
                  }
                });
              }
            });
          });
        });
      }
    });
    return total;
  };
  const refetchCart = () => {
    fetchCartCustomer();
  };
  return {
    cartCustomer,
    isLoading,
    totalQuantityCake,
    handleShowSelectedVariant,
    handlePrice,
    deleteCakeFromBranchCart,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    totalPayment,
    totalBranch,
    refetchCart,
  };
};

export default useCart;
