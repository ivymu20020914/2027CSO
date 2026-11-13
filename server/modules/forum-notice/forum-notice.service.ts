import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, like } from 'drizzle-orm';
import { forumNotice } from '@server/database/schema';
import type { ForumNoticeDTO } from '@shared/api.interface';
import type { CreateNoticeDto, UpdateNoticeDto } from './forum-notice.dto';

type ForumNoticeRow = typeof forumNotice.$inferSelect;
type NoticeInsert = typeof forumNotice.$inferInsert;

function extractPostgresErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current && typeof current === 'object'; depth += 1) {
    const { code, cause } = current as { code?: unknown; cause?: unknown };
    if (typeof code === 'string') return code;
    current = cause;
  }
  return undefined;
}

@Injectable()
export class ForumNoticeService {
  private readonly logger = new Logger(ForumNoticeService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private mapEditableFields(dto: CreateNoticeDto | UpdateNoticeDto): Omit<
    NoticeInsert,
    'id' | 'noticeId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'
  > {
    return {
      scope: dto.scope,
      moduleId: dto.moduleId,
      moduleSheet: dto.moduleSheet,
      title: dto.title,
      draftDate: dto.draftDate,
      approveDeadline: dto.approveDeadline,
      publishDate: dto.publishDate,
      frequency: dto.frequency,
      audience: dto.audience,
      channel: dto.channel,
      keyMessage: dto.keyMessage,
      owner: dto.owner,
      approver: dto.approver,
      requiredAction: dto.requiredAction,
      status: dto.status,
      confidentiality: dto.confidentiality,
    };
  }

  private async nextNoticeId(): Promise<string> {
    const rows = await this.db
      .select({ noticeId: forumNotice.noticeId })
      .from(forumNotice)
      .where(like(forumNotice.noticeId, 'N%'));
    let max = 0;
    for (const row of rows) {
      const matched = /^N(\d+)$/.exec(row.noticeId);
      if (matched) max = Math.max(max, Number(matched[1]));
    }
    return `N${String(max + 1).padStart(3, '0')}`;
  }

  async createNotice(
    dto: CreateNoticeDto,
    userId: string,
  ): Promise<{ notice: ForumNoticeDTO }> {
    const fields = this.mapEditableFields(dto);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const noticeId = await this.nextNoticeId();
      try {
        const rows = await this.db
          .insert(forumNotice)
          .values({
            ...fields,
            noticeId,
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .returning();
        this.logger.log(`创建公告 ${noticeId}，操作人 ${userId}`);
        return { notice: this.toDto(rows[0]) };
      } catch (error) {
        if (extractPostgresErrorCode(error) === '23505' && attempt < 4) {
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException('公告编号生成冲突，请稍后重试');
  }

  async deleteNotice(noticeId: string): Promise<{ noticeId: string }> {
    const rows = await this.db
      .delete(forumNotice)
      .where(eq(forumNotice.noticeId, noticeId))
      .returning({ noticeId: forumNotice.noticeId });
    if (rows.length === 0) {
      throw new NotFoundException(`公告 ${noticeId} 不存在`);
    }
    this.logger.log(`删除公告 ${noticeId}`);
    return { noticeId: rows[0].noticeId };
  }

  private toDto(row: ForumNoticeRow): ForumNoticeDTO {
    return {
      noticeId: row.noticeId,
      scope: row.scope,
      moduleId: row.moduleId,
      moduleSheet: row.moduleSheet ?? '',
      title: row.title,
      draftDate: row.draftDate ?? '',
      approveDeadline: row.approveDeadline ?? '',
      publishDate: row.publishDate ?? '',
      frequency: row.frequency ?? '',
      audience: row.audience ?? '',
      channel: row.channel ?? '',
      keyMessage: row.keyMessage ?? '',
      owner: row.owner,
      approver: row.approver ?? '',
      requiredAction: row.requiredAction ?? '',
      status: row.status,
      confidentiality: row.confidentiality ?? '',
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedBy ?? null,
    };
  }

  async listNotices(): Promise<{
    items: ForumNoticeDTO[];
    total: number;
  }> {
    const rows: ForumNoticeRow[] = await this.db
      .select()
      .from(forumNotice)
      .orderBy(forumNotice.noticeId);
    return { items: rows.map((row) => this.toDto(row)), total: rows.length };
  }

  async updateStatus(
    noticeId: string,
    status: string,
    userId: string,
  ): Promise<{ notice: ForumNoticeDTO }> {
    const rows = await this.db
      .update(forumNotice)
      .set({
        status,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(forumNotice.noticeId, noticeId))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException(`公告 ${noticeId} 不存在`);
    }
    this.logger.log(`公告 ${noticeId} 状态更新为 ${status}，操作人 ${userId}`);
    return { notice: this.toDto(rows[0]) };
  }

  async updateNotice(
    noticeId: string,
    dto: UpdateNoticeDto,
    userId: string,
  ): Promise<{ notice: ForumNoticeDTO }> {
    const rows = await this.db
      .update(forumNotice)
      .set({
        scope: dto.scope,
        moduleId: dto.moduleId,
        moduleSheet: dto.moduleSheet,
        title: dto.title,
        draftDate: dto.draftDate,
        approveDeadline: dto.approveDeadline,
        publishDate: dto.publishDate,
        frequency: dto.frequency,
        audience: dto.audience,
        channel: dto.channel,
        keyMessage: dto.keyMessage,
        owner: dto.owner,
        approver: dto.approver,
        requiredAction: dto.requiredAction,
        status: dto.status,
        confidentiality: dto.confidentiality,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(forumNotice.noticeId, noticeId))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException(`公告 ${noticeId} 不存在`);
    }
    this.logger.log(`编辑公告 ${noticeId}，操作人 ${userId}`);
    return { notice: this.toDto(rows[0]) };
  }
}
