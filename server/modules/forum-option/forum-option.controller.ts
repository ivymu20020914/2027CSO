import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { ForumOptionService } from './forum-option.service';
import { CreateOptionDto } from './forum-option.dto';
import type {
  CreateOptionResponse,
  ForumOptionListResponse,
} from '@shared/api.interface';

@Controller('api/forum-options')
export class ForumOptionController {
  constructor(private readonly forumOptionService: ForumOptionService) {}

  @Get()
  async list(): Promise<ForumOptionListResponse> {
    return this.forumOptionService.listOptions();
  }

  @NeedLogin()
  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateOptionDto,
  ): Promise<CreateOptionResponse> {
    const { userId } = req.userContext;
    return this.forumOptionService.createOption(dto, userId);
  }
}
