import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { GetPostsRequestDto } from './dto/get-post.dto';
import { JwtAccessGuard } from 'src/auth/guard/jwt-access.guard';
import { User } from 'src/auth/decorator/user.decorator';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/categories')
  async getCategories() {
    return this.postService.getCategories();
  }

  @Post()
  @UseGuards(JwtAccessGuard)
  create(@User() user, @Body() dto: CreatePostDto) {
    return this.postService.create(user.userId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAccessGuard)
  update(@User() user, @Param('id', ParseIntPipe) postId: number, @Body() dto: CreatePostDto) {
    return this.postService.update(user.userId, postId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  delete(@User() user, @Param('id', ParseIntPipe) postId: number) {
    return this.postService.delete(user.userId, postId);
  }

  @Get(':id')
  getDetail(@Param('id', ParseIntPipe) postId: number) {
    return this.postService.getDetail(postId);
  }

  @Get()
  async getPosts(@Query() query: GetPostsRequestDto) {
    return this.postService.getPosts(query);
  }
}
