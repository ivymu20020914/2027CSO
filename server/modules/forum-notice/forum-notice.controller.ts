import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { ForumNoticeService } from './forum-notice.service';
import {
  CreateNoticeDto,
  UpdateNoticeDto,
  UpdateNoticeStatusDto,
} from './forum-notice.dto';
import type {
  CreateNoticeResponse,
  DeleteNoticeResponse,
  ForumNoticeListResponse,
  UpdateNoticeResponse,
  UpdateNoticeStatusResponse,
} from '@shared/api.interface';

@Controller('api/forum-notices')
export class ForumNoticeController {
  constructor(private readonly forumNoticeService: ForumNoticeService) {}

  @Get()
  async list(): Promise<ForumNoticeListResponse> {
    return this.forumNoticeService.listNotices();
  }

  @NeedLogin()
  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateNoticeDto,
  ): Promise<CreateNoticeResponse> {
    const { userId } = req.userContext;
    return this.forumNoticeService.createNotice(dto, userId);
  }

  @NeedLogin()
  @Put(':noticeId')
  async update(
    @Req() req: Request,
    @Param('noticeId') noticeId: string,
    @Body() dto: UpdateNoticeDto,
  ): Promise<UpdateNoticeResponse> {
    const { userId } = req.userContext;
    return this.forumNoticeService.updateNotice(noticeId, dto, userId);
  }

  @NeedLogin()
  @Patch(':noticeId/status')
  async updateStatus(
    @Req() req: Request,
    @Param('noticeId') noticeId: string,
    @Body() dto: UpdateNoticeStatusDto,
  ): Promise<UpdateNoticeStatusResponse> {
    const { userId } = req.userContext;
    return this.forumNoticeService.updateStatus(noticeId, dto.status, userId);
  }

  @NeedLogin()
  @Delete(':noticeId')
  async remove(
    @Param('noticeId') noticeId: string,
  ): Promise<DeleteNoticeResponse> {
    return this.forumNoticeService.deleteNotice(noticeId);
  }
}
