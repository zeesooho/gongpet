import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetPostsRequestDto } from './dto/get-post.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  static readonly previewLength: number = 50;

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: CreatePostDto) {
    const { title, content, categoryId, labelId } = dto;

    // 트랜잭션으로 post와 postMeta를 함께 생성
    return this.prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title,
          content,
          userId,
          categoryId,
          labelId,
          createdAt: new Date(),
          updatedAt: new Date(),
          postMeta: {
            create: {
              views: 0,
              likes: 0,
              commentsCount: 0,
            },
          },
        },
        include: {
          category: true,
          label: true,
          postMeta: true,
          user: {
            select: {
              userProfile: {
                select: {
                  nickname: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      });

      return post;
    });
  }

  async update(userId: number, postId: number, dto: CreatePostDto) {
    const { title, content, categoryId, labelId } = dto;

    // 게시글 존재 여부와 작성자 확인
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        userId,
        isDeleted: false,
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 업데이트 수행
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(categoryId && { categoryId }),
        ...(labelId && { labelId }),
        updatedAt: new Date(),
      },
      include: {
        category: true,
        label: true,
        postMeta: true,
        user: {
          select: {
            userProfile: {
              select: {
                nickname: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(userId: number, postId: number) {
    // 게시글 존재 여부와 작성자 확인
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        userId,
        isDeleted: false,
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // soft delete 수행
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });
  }

  async getPosts(dto: GetPostsRequestDto) {
    const { page = 1, limit = 20, categoryId = null } = dto;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          isDeleted: false,
          ...(categoryId && { categoryId }),
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          categoryId: true,
          user: {
            select: {
              userProfile: {
                select: {
                  nickname: true,
                  imageUrl: true,
                },
              },
            },
          },
          postMeta: {
            select: {
              views: true,
              likes: true,
              commentsCount: true,
            },
          },
        },
      }),
      this.prisma.post.count({
        where: {
          isDeleted: false,
        },
      }),
    ]);

    return {
      posts,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDetail(postId: number) {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        isDeleted: false,
      },
      include: {
        category: true,
        label: true,
        postMeta: true,
        user: {
          select: {
            userProfile: {
              select: {
                nickname: true,
                imageUrl: true,
              },
            },
          },
        },
        comments: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                userProfile: {
                  select: {
                    nickname: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    // 조회수 증가 (비동기로 처리)
    this.increaseViewCount(postId).catch((error) => {
      console.error('조회수 증가 실패:', error);
    });

    return post;
  }

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        abbreviation: true,
        description: true,
        hasLabel: true,
        labels: true,
      },
    });
    return categories;
  }

  private async increaseViewCount(postId: number) {
    await this.prisma.postMeta.update({
      where: { postId },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }

  // 추가 유틸리티 메소드들
  async getPopularPosts(categoryId?: number, limit: number = 5) {
    return this.prisma.post.findMany({
      where: {
        isDeleted: false,
        ...(categoryId && { categoryId }),
      },
      take: limit,
      orderBy: {
        postMeta: {
          views: 'desc',
        },
      },
      include: {
        postMeta: true,
        user: {
          select: {
            userProfile: {
              select: {
                nickname: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserPosts(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    return this.prisma.post.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        postMeta: true,
        category: true,
      },
    });
  }

  async checkPostOwnership(userId: number, postId: number): Promise<boolean> {
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        userId,
        isDeleted: false,
      },
    });

    return !!post;
  }

  _generatePreview(content: string): string {
    return content.trim().slice(0, PostService.previewLength) + (content.trim().length > PostService.previewLength)
      ? '...'
      : '';
  }
}
