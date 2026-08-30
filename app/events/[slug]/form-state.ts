export type RegisterState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialRegisterState: RegisterState = { status: "idle" };
