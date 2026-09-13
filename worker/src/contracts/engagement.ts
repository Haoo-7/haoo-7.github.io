import { z } from 'zod';

export const ArticleSlugSchema = z.string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const EmailSchema = z.string().trim().max(320).pipe(z.email());

export const RequestEmailCodeInputSchema = z.object({
  email: EmailSchema,
});

export const VerifyEmailCodeInputSchema = z.object({
  email: EmailSchema,
  code: z.string().regex(/^\d{6}$/),
});

export const CreateCommentInputSchema = z.object({
  slug: ArticleSlugSchema,
  displayName: z.string().trim().min(2).max(20),
  content: z.string().trim().min(2).max(800),
  turnstileToken: z.string().max(2048).optional(),
}).strict();

export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;

export const VisitorCommandSchema = z.object({
  slug: ArticleSlugSchema,
  visitorId: z.uuid(),
  commentCursor: z.number().int().positive().optional(),
});

export type VisitorCommand = z.infer<typeof VisitorCommandSchema>;

export const EngagementErrorCodeSchema = z.enum([
  'VALIDATION_ERROR',
  'DATABASE_ERROR',
  'RATE_LIMITED',
  'EMAIL_UNAVAILABLE',
  'CODE_INVALID',
  'VERIFICATION_REQUIRED',
  'TURNSTILE_REQUIRED',
  'TURNSTILE_FAILED',
  'ADMIN_UNAUTHORIZED',
  'ADMIN_FORBIDDEN',
  'NOT_FOUND',
]);

export const EngagementFailureSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: EngagementErrorCodeSchema,
    message: z.string(),
    recoverable: z.boolean(),
  }),
});

export const RecordViewSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    views: z.number().int().nonnegative(),
    counted: z.boolean(),
  }),
});

export type RecordViewResult =
  | z.infer<typeof RecordViewSuccessSchema>
  | z.infer<typeof EngagementFailureSchema>;

export interface RecordViewSpec {
  recordView(input: VisitorCommand): Promise<RecordViewResult>;
}

export const CommentStatusSchema = z.enum(['approved', 'pending']);

export const CreateCommentCommandSchema = CreateCommentInputSchema.extend({
  visitorId: z.uuid(),
  status: CommentStatusSchema,
  emailHmac: z.string().length(64).optional(),
});

export type CreateCommentCommand = z.infer<typeof CreateCommentCommandSchema>;

export const PublicCommentSchema = z.object({
  id: z.number().int().positive(),
  displayName: z.string(),
  content: z.string(),
  contentHtml: z.string().optional(),
  createdAt: z.iso.datetime(),
});

export type PublicComment = z.infer<typeof PublicCommentSchema>;

export const CreateCommentSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    comment: PublicCommentSchema,
    pending: z.boolean(),
  }),
});

export type CreateCommentResult =
  | z.infer<typeof CreateCommentSuccessSchema>
  | z.infer<typeof EngagementFailureSchema>;

export interface CreateCommentSpec {
  createComment(input: CreateCommentCommand): Promise<CreateCommentResult>;
}

export const ToggleLikeSuccessSchema = z.object({
  success: z.literal(true),
  data: z.object({
    liked: z.boolean(),
    likes: z.number().int().nonnegative(),
  }),
});

export type ToggleLikeResult =
  | z.infer<typeof ToggleLikeSuccessSchema>
  | z.infer<typeof EngagementFailureSchema>;

export interface ToggleLikeSpec {
  toggleLike(input: VisitorCommand): Promise<ToggleLikeResult>;
}

export const EngagementDataSchema = z.object({
  views: z.number().int().nonnegative(),
  likes: z.number().int().nonnegative(),
  liked: z.boolean(),
  comments: z.array(PublicCommentSchema),
  nextCursor: z.string().nullable().optional(),
});

export type EngagementData = z.infer<typeof EngagementDataSchema>;

export const GetEngagementSuccessSchema = z.object({
  success: z.literal(true),
  data: EngagementDataSchema,
});

export type GetEngagementResult =
  | z.infer<typeof GetEngagementSuccessSchema>
  | z.infer<typeof EngagementFailureSchema>;

export interface GetEngagementSpec {
  getEngagement(input: VisitorCommand): Promise<GetEngagementResult>;
}
