import { ICustomer } from "./customer";

export interface ISignInForm {
  email: string;
  password: string;
  provider: string;
}

export interface ISignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  provider: string;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
  customerInfo: ICustomer;
}
