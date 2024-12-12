export interface IAPIResponseError {
  status: "failure" | "error";
  message: string;
  results: unknown;
}
