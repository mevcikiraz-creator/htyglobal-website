import { z } from "zod";
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().max(200).default(""),
  email: z.email().max(200),
  phone: z.string().max(60).default(""),
  country: z.string().max(100).default(""),
  subject: z.string().max(200).default(""),
  message: z.string().trim().min(10).max(10000),
  projectName: z.string().max(200).default(""),
  projectLocation: z.string().max(200).default(""),
  projectType: z.string().max(100).default(""),
  quantity: z.string().max(60).default(""),
  productSlug: z.string().max(200).default(""),
  woodType: z.enum(["", "beech", "walnut", "oak", "ash"]).default(""),
});
export const contentSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(1).max(250),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(200),
  description: z.string().max(20000),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.boolean(),
  sortOrder: z.number().int().min(0),
  data: z.record(z.string(), z.unknown()),
  translations: z.record(
    z.string(),
    z.object({
      title: z.string().max(250).optional(),
      description: z.string().max(20000).optional(),
      data: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
});
