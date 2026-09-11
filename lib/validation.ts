import { z } from "zod";

export const registrationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Введите ФИО полностью")
    .max(200),
  // Российский формат: +7/8/7 и 10 цифр после кода страны. Приводим к
  // единому виду +7XXXXXXXXXX независимо от того, как ввёл пользователь
  // (с пробелами/скобками/дефисами, с 8 или без плюса).
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+()\s-]+$/, "Введите корректный номер телефона")
    .transform((v) => v.replace(/[\s()-]/g, ""))
    .refine((v) => /^(\+7|8|7)\d{10}$/.test(v), {
      message: "Введите российский номер телефона в формате +7 XXX XXX-XX-XX",
    })
    .transform((v) => `+7${v.replace(/^(\+7|8|7)/, "")}`),
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  company: z.string().trim().min(1, "Укажите компанию").max(200),
  position: z.string().trim().min(1, "Укажите должность").max(200),
  consentGiven: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .nullable()
    .transform((v) => v === "on" || v === "true" || v === true)
    .refine((v) => v === true, {
      message: "Необходимо согласие на обработку персональных данных",
    }),
  // Согласие на рекламную рассылку — отдельное от согласия на обработку ПД
  // (ст. 18 38-ФЗ "О рекламе"): необязательное, не может быть условием
  // регистрации, поэтому здесь нет .refine на true — не отмечено = false.
  marketingConsent: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .nullable()
    .optional()
    .transform((v) => v === "on" || v === "true" || v === true),
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
    .nullable()
    .optional()
    .transform((v) => v === "on" || v === "true" || v === true),
});
