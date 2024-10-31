export class PostListItemDto {
  id: number;
  title: string;
  preview: string;
  createdAt: Date;
  author: {
    nickname: string;
    imageUrl?: string;
  };
  meta: {
    views: number;
    likes: number;
    commentsCount: number;
  };
}