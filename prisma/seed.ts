// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { Role, From } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 자식 댓글부터 삭제
  await prisma.comment.deleteMany({
    where: {
      NOT: {
        parentCommentId: null
      }
    }
  });

  // 그 다음 부모 댓글 삭제
  await prisma.comment.deleteMany({
    where: {
      parentCommentId: null
    }
  });
  
  // 기존 데이터 정리
  await prisma.$transaction([
    prisma.postMeta.deleteMany(),
    prisma.post.deleteMany(),
    prisma.pet.deleteMany(),
    prisma.userProfile.deleteMany(),
    prisma.user.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  await prisma.$transaction([
    // AUTO_INCREMENT 초기화
    prisma.$executeRaw`ALTER TABLE PostMeta AUTO_INCREMENT = 1;`,
    prisma.$executeRaw`ALTER TABLE Post AUTO_INCREMENT = 1;`,
    prisma.$executeRaw`ALTER TABLE Pet AUTO_INCREMENT = 1;`,
    prisma.$executeRaw`ALTER TABLE UserProfile AUTO_INCREMENT = 1;`,
    prisma.$executeRaw`ALTER TABLE User AUTO_INCREMENT = 1;`,
    prisma.$executeRaw`ALTER TABLE Category AUTO_INCREMENT = 1;`,
  ]);

  // 카테고리 생성
  const categories = await prisma.category.createMany({
    data: [
      { name: '😊 자유 게시판', abbreviation: '자유', description: '자유롭게 소통해요.' },
      { name: '😊 지역 게시판', abbreviation: '지역', description: '우리 지역 이야기를 나눠요.' },
      { name: '😊 용품 리뷰 게시판', abbreviation: '용품 리뷰', description: '어떤 반려견 용품을 써보셨나요?' },
      { name: '😊 입양 후기 게시판', abbreviation: '입양 후기', description: '유기견 입양을 하셨나요?' },
      { name: '😊 정보 공유 게시판', abbreviation: '정보 공유', description: '자유롭게 정보를 공유해요.' },
    ],
  });

  // 사용자 생성
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'user1@example.com',
        ageRange: '20-29',
        gender: 'female',
        registrationAt: new Date(),
        role: Role.USER,
        from: From.ORIGIN,
        userProfile: {
          create: {
            nickname: '멍멍이집사',
            imageUrl: 'https://picsum.photos/200/300.jpg',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'user2@example.com',
        ageRange: '30-39',
        gender: 'male',
        registrationAt: new Date(),
        role: Role.USER,
        from: From.KAKAO,
        userProfile: {
          create: {
            nickname: '냥냥이집사',
            imageUrl: 'https://picsum.photos/200/300.jpg',
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        ageRange: '30-39',
        gender: 'male',
        registrationAt: new Date(),
        role: Role.ADMIN,
        from: From.ORIGIN,
        userProfile: {
          create: {
            nickname: '관리자',
            imageUrl: 'https://picsum.photos/200/300.jpg',
          },
        },
      },
    }),
  ]);

  // 게시글 생성
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: '우리 강아지 사진입니다',
        content: '오늘 공원에서 찍은 우리 강아지 사진이에요. 너무 귀엽지 않나요? 날씨도 좋고 산책하기 딱 좋았어요.',
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: users[0].id,
        categoryId: 1,
        postMeta: {
          create: {
            views: 42,
            likes: 15,
            commentsCount: 3,
          },
        },
      },
    }),
    prisma.post.create({
      data: {
        title: '강아지 사료 추천해주세요',
        content: '현재 우리 강아지가 사료를 잘 안먹네요. 좋은 사료 추천해주실 분 있나요? 나이는 3살이고 소형견입니다.',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1일 전
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        userId: users[1].id,
        categoryId: 2,
        postMeta: {
          create: {
            views: 128,
            likes: 8,
            commentsCount: 5,
          },
        },
      },
    }),
    prisma.post.create({
      data: {
        title: '[공지] 커뮤니티 이용 규칙',
        content: '안녕하세요. 커뮤니티를 이용하실 때는 다음 규칙을 지켜주세요...',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7일 전
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        userId: users[2].id,
        categoryId: 3,
        postMeta: {
          create: {
            views: 552,
            likes: 124,
            commentsCount: 2,
          },
        },
      },
    }),
  ]);

  // 댓글 생성
  const comments = await Promise.all([
    // 첫 번째 게시글의 댓글들
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        userId: users[1].id,
        content: '너무 귀엽네요! 우리 강아지랑 친구하면 좋겠어요 ^^',
        likes: 5,
        createdAt: new Date(),
      },
    }),
    prisma.comment.create({
      data: {
        postId: posts[0].id,
        userId: users[2].id,
        content: '건강하고 행복해보여요~',
        likes: 3,
        createdAt: new Date(),
      },
    }),
    
    // 두 번째 게시글의 댓글들과 답글
    prisma.comment.create({
      data: {
        postId: posts[1].id,
        userId: users[0].id,
        content: '저희 강아지는 A사 사료를 잘 먹어요',
        likes: 8,
        createdAt: new Date(),
      },
    }),
  ]);

  // 두 번째 게시글 첫 댓글의 답글
  await prisma.comment.create({
    data: {
      postId: posts[1].id,
      parentCommentId: comments[2].id,
      userId: users[1].id,
      content: '감사합니다! 한번 시도해볼게요',
      likes: 2,
      createdAt: new Date(),
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });