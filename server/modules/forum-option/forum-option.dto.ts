import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';
import { OPTION_CATEGORIES } from '@shared/api.interface';
import type { CreateOptionRequest } from '@shared/api.interface';

export class CreateOptionDto implements CreateOptionRequest {
  @IsIn(OPTION_CATEGORIES)
  category!:
    | 'module'
    | 'owner'
    | 'status'
    | 'priority'
    | 'notice_scope'
    | 'decision_status';

  @IsString()
  @MinLength(1, { message: '选项内容不能为空' })
  @MaxLength(64, { message: '选项内容不能超过 64 个字符' })
  value!: string;
}
