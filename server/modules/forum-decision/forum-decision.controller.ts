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
import { ForumDecisionService } from './forum-decision.service';
import {
  CreateDecisionDto,
  UpdateDecisionDto,
  UpdateDecisionStatusDto,
} from './forum-decision.dto';
import type {
  CreateDecisionResponse,
  DeleteDecisionResponse,
  ForumDecisionListResponse,
  UpdateDecisionResponse,
  UpdateDecisionStatusResponse,
} from '@shared/api.interface';

@Controller('api/forum-decisions')
export class ForumDecisionController {
  constructor(private readonly forumDecisionService: ForumDecisionService) {}

  @Get()
  async list(): Promise<ForumDecisionListResponse> {
    return this.forumDecisionService.listDecisions();
  }

  @NeedLogin()
  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateDecisionDto,
  ): Promise<CreateDecisionResponse> {
    const { userId } = req.userContext;
    return this.forumDecisionService.createDecision(dto, userId);
  }

  @NeedLogin()
  @Put(':decisionId')
  async update(
    @Req() req: Request,
    @Param('decisionId') decisionId: string,
    @Body() dto: UpdateDecisionDto,
  ): Promise<UpdateDecisionResponse> {
    const { userId } = req.userContext;
    return this.forumDecisionService.updateDecision(decisionId, dto, userId);
  }

  @NeedLogin()
  @Patch(':decisionId/status')
  async updateStatus(
    @Req() req: Request,
    @Param('decisionId') decisionId: string,
    @Body() dto: UpdateDecisionStatusDto,
  ): Promise<UpdateDecisionStatusResponse> {
    const { userId } = req.userContext;
    return this.forumDecisionService.updateStatus(
      decisionId,
      dto.status,
      userId,
    );
  }

  @NeedLogin()
  @Delete(':decisionId')
  async remove(
    @Param('decisionId') decisionId: string,
  ): Promise<DeleteDecisionResponse> {
    return this.forumDecisionService.deleteDecision(decisionId);
  }
}
