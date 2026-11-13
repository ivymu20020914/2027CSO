import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { and, eq, like } from 'drizzle-orm';
import { forumOption } from '@server/database/schema';
import { CreateOptionDto } from './forum-option.dto';
import type {
  CreateOptionResponse,
  ForumOptionDTO,
  ForumOptionListResponse,
  OptionCategory,
} from '@shared/api.interface';

type ForumOptionRow = typeof forumOption.$inferSelect;

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
export class ForumOptionService {
  private readonly logger = new Logger(ForumOptionService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private toDto(row: ForumOptionRow): ForumOptionDTO {
    return {
      category: row.category as OptionCategory,
      value: row.value,
      code: row.code ?? null,
      sortOrder: row.sortOrder,
    };
  }

  private async nextModuleCode(): Promise<string> {
    const rows = await this.db
      .select({ code: forumOption.code })
      .from(forumOption)
      .where(like(forumOption.code, 'C%'));
    let max = 0;
    for (const row of rows) {
      const matched = /^C(\d+)$/.exec(row.code ?? '');
      if (matched) max = Math.max(max, Number(matched[1]));
    }
    return `C${String(max + 1).padStart(2, '0')}`;
  }

  private async nextSortOrder(category: OptionCategory): Promise<number> {
    const rows = await this.db
      .select({ sortOrder: forumOption.sortOrder })
      .from(forumOption)
      .where(eq(forumOption.category, category));
    let max = 0;
    for (const row of rows) {
      max = Math.max(max, row.sortOrder);
    }
    return max + 1;
  }

  async listOptions(): Promise<ForumOptionListResponse> {
    const rows: ForumOptionRow[] = await this.db
      .select()
      .from(forumOption)
      .orderBy(forumOption.category, forumOption.sortOrder);
    return { items: rows.map((row: ForumOptionRow) => this.toDto(row)) };
  }

  async createOption(
    dto: CreateOptionDto,
    userId: string,
  ): Promise<CreateOptionResponse> {
    const value: string = dto.value.trim();
    if (value.length === 0) {
      throw new BadRequestException('选项内容不能为空');
    }

    const duplicated = await this.db
      .select({ value: forumOption.value })
      .from(forumOption)
      .where(
        and(
          eq(forumOption.category, dto.category),
          eq(forumOption.value, value),
        ),
      )
      .limit(1);
    if (duplicated.length > 0) {
      throw new ConflictException(`「${value}」已存在`);
    }

    const sortOrder: number = await this.nextSortOrder(dto.category);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code: string | null =
        dto.category === 'module' ? await this.nextModuleCode() : null;
      try {
        const rows = await this.db
          .insert(forumOption)
          .values({
            category: dto.category,
            value,
            code,
            sortOrder,
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .returning();
        this.logger.log(
          `新增选项 ${dto.category}=${value}，操作人 ${userId}`,
        );
        return { option: this.toDto(rows[0]) };
      } catch (error) {
        if (extractPostgresErrorCode(error) === '23505' && attempt < 4) {
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException('选项编号生成冲突，请稍后重试');
  }
}
