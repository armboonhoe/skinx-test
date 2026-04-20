import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .superRefine((value, ctx) => {
    if (!/[A-Za-z]/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one letter',
      });
    }
    if (!/[0-9]/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one number',
      });
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one symbol',
      });
    }
  });

export const registerSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: passwordSchema,
  name: z.string().trim().min(1).max(100).optional(),
});

// Login must NOT enforce complexity — doing so leaks the policy and would
// break users whose passwords predate the rule. Reject purely by credential match.
export const loginSchema = z.object({
  email: z.string().email().max(255).toLowerCase(),
  password: z.string().min(1).max(128),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
