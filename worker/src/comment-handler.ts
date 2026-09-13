import type {
  CreateCommentCommand,
  CreateCommentResult,
  CreateCommentSpec,
  PublicComment,
} from './contracts/engagement';

export interface CommentRepository {
  consumeAllowance(input: CreateCommentCommand): Promise<boolean>;
  createComment(input: CreateCommentCommand): Promise<PublicComment>;
}

export class CommentHandler implements CreateCommentSpec {
  constructor(private readonly repository: CommentRepository) {}

  async createComment(input: CreateCommentCommand): Promise<CreateCommentResult> {
    try {
      if (!await this.repository.consumeAllowance(input)) {
        return {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: '评论太频繁，请稍后再试。',
            recoverable: true,
          },
        };
      }

      return {
        success: true,
        data: {
          comment: await this.repository.createComment(input),
          pending: input.status === 'pending',
        },
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: '暂时无法提交评论。',
          recoverable: true,
        },
      };
    }
  }
}
