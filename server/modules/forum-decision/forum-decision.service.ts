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
import { forumDecision } from '@server/database/schema';
import type { ForumDecisionDTO } from '@shared/api.interface';
import type { CreateDecisionDto, UpdateDecisionDto } from './forum-decision.dto';

type ForumDecisionRow = typeof forumDecision.$inferSelect;
type DecisionInsert = typeof forumDecision.$inferInsert;

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
export class ForumDecisionService {
  private readonly logger = new Logger(ForumDecisionService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private mapEditableFields(dto: CreateDecisionDto | UpdateDecisionDto): Omit<
    DecisionInsert,
    | 'id'
    | 'decisionId'
    | 'createdAt'
    | 'createdBy'
    | 'updatedAt'
    | 'updatedBy'
  > {
    return {
      domain: dto.domain,
      question: dto.question,
      deadline: dto.deadline,
      owner: dto.owner,
      decider: dto.decider,
      impact: dto.impact,
      status: dto.status,
      basis: dto.basis,
      conclusion: dto.conclusion,
    };
  }

  private async nextDecisionId(): Promise<string> {
    const rows = await this.db
      .select({ decisionId: forumDecision.decisionId })
      .from(forumDecision)
      .where(like(forumDecision.decisionId, 'D%'));
    let max = 0;
    for (const row of rows) {
      const matched = /^D(\d+)$/.exec(row.decisionId);
      if (matched) max = Math.max(max, Number(matched[1]));
    }
    return `D${String(max + 1).padStart(2, '0')}`;
  }

  async createDecision(
    dto: CreateDecisionDto,
    userId: string,
  ): Promise<{ decision: ForumDecisionDTO }> {
    const fields = this.mapEditableFields(dto);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const decisionId = await this.nextDecisionId();
      try {
        const rows = await this.db
          .insert(forumDecision)
          .values({
            ...fields,
            decisionId,
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .returning();
        this.logger.log(`创建决策 ${decisionId}，操作人 ${userId}`);
        return { decision: this.toDto(rows[0]) };
      } catch (error) {
        if (extractPostgresErrorCode(error) === '23505' && attempt < 4) {
          continue;
        }
        throw error;
      }
    }
    throw new ConflictException('决策编号生成冲突，请稍后重试');
  }

  async deleteDecision(decisionId: string): Promise<{ decisionId: string }> {
    const rows = await this.db
      .delete(forumDecision)
      .where(eq(forumDecision.decisionId, decisionId))
      .returning({ decisionId: forumDecision.decisionId });
    if (rows.length === 0) {
      throw new NotFoundException(`决策 ${decisionId} 不存在`);
    }
    this.logger.log(`删除决策 ${decisionId}`);
    return { decisionId: rows[0].decisionId };
  }

  private toDto(row: ForumDecisionRow): ForumDecisionDTO {
    return {
      decisionId: row.decisionId,
      domain: row.domain,
      question: row.question,
      deadline: row.deadline ?? '',
      owner: row.owner,
      decider: row.decider ?? '',
      impact: row.impact ?? '',
      status: row.status,
      basis: row.basis ?? '',
      conclusion: row.conclusion ?? '',
      updatedAt: row.updatedAt.toISOString(),
      updatedBy: row.updatedBy ?? null,
    };
  }

  async listDecisions(): Promise<{
    items: ForumDecisionDTO[];
    total: number;
  }> {
    const rows: ForumDecisionRow[] = await this.db
      .select()
      .from(forumDecision)
      .orderBy(forumDecision.decisionId);
    return { items: rows.map((row) => this.toDto(row)), total: rows.length };
  }

  async updateStatus(
    decisionId: string,
    status: string,
    userId: string,
  ): Promise<{ decision: ForumDecisionDTO }> {
    const rows = await this.db
      .update(forumDecision)
      .set({
        status,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(forumDecision.decisionId, decisionId))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException(`决策 ${decisionId} 不存在`);
    }
    this.logger.log(`决策 ${decisionId} 状态更新为 ${status}，操作人 ${userId}`);
    return { decision: this.toDto(rows[0]) };
  }

  async updateDecision(
    decisionId: string,
    dto: UpdateDecisionDto,
    userId: string,
  ): Promise<{ decision: ForumDecisionDTO }> {
    const rows = await this.db
      .update(forumDecision)
      .set({
        domain: dto.domain,
        question: dto.question,
        deadline: dto.deadline,
        owner: dto.owner,
        decider: dto.decider,
        impact: dto.impact,
        status: dto.status,
        basis: dto.basis,
        conclusion: dto.conclusion,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(forumDecision.decisionId, decisionId))
      .returning();

    if (rows.length === 0) {
      throw new NotFoundException(`决策 ${decisionId} 不存在`);
    }
    this.logger.log(`编辑决策 ${decisionId}，操作人 ${userId}`);
    return { decision: this.toDto(rows[0]) };
  }
}
