export type EventFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialEventFormState: EventFormState = { status: "idle" };
