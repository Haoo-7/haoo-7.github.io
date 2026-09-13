import type {
  ToggleLikeResult,
  ToggleLikeSpec,
  VisitorCommand,
} from './contracts/engagement';

export interface LikeRepository {
  toggleLike(input: VisitorCommand): Promise<{ liked: boolean; likes: number }>;
}

export class LikeHandler implements ToggleLikeSpec {
  constructor(private readonly repository: LikeRepository) {}

  async toggleLike(input: VisitorCommand): Promise<ToggleLikeResult> {
    try {
      return {
        success: true,
        data: await this.repository.toggleLike(input),
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: '暂时无法更新点赞。',
          recoverable: true,
        },
      };
    }
  }
}
