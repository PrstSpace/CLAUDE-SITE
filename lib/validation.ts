import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Введите ФИО полностью")
    .max(200),
  phone: z
    .string()
    .trim()
    .min(5, "Введите корректный номер телефона")
    .max(30)
    .regex(/^[0-9+()\s-]+$/, "Введите корректный номер телефона"),
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  company: z.string().trim().min(1, "Укажите компанию").max(200),
  position: z.string().trim().min(1, "Укажите должность").max(200),
  consentGiven: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .transform((v) => v === "on" || v === "true" || v === true)
    .refine((v) => v === true, {
      message: "Необходимо согласие на обработку персональных данных",
    }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const eventFormSchema = z.object({
  title: z.string().trim().min(1, "Укажите название мероприятия").max(200),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Укажите slug")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug может содержать только латиницу, цифры и дефис"),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  location: z.string().trim().max(300).optional().or(z.literal("")),
  startsAt: z.string().min(1, "Укажите дату начала"),
  endsAt: z.string().optional().or(z.literal("")),
  isActive: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .optional()
    .transform((v) => v === "on" || v === "true" || v === true),
});
