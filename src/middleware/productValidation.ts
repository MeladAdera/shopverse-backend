import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive").max(9999999.99, "Price is too high"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  category_id: z.number().int().positive("Category is required"),
  image_urls: z.array(z.string().url("Image URL is invalid")).optional(),
});

export const updateProductSchema = createProductSchema.partial();