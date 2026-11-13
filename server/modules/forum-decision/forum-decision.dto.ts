import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import type {
  CreateDecisionRequest,
  UpdateDecisionRequest,
  UpdateDecisionStatusRequest,
} from '@shared/api.interface';

export class UpdateDecisionStatusDto implements UpdateDecisionStatusRequest {
  @IsString()
  @IsNotEmpty({ message: '决策状态不能为空' })
  @MaxLength(32, { message: '决策状态不能超过 32 个字符' })
  status!: string;
}

// 空字符串或 YYYY-MM-DD；可空日期由前端传空串
const DATE_PATTERN = /^$|^\d{4}-\d{2}-\d{2}$/;

class DecisionEditableFieldsDto {
  @IsString()
  @IsNotEmpty({ message: '决策领域不能为空' })
  domain!: string;

  @IsString()
  @IsNotEmpty({ message: '决策问题不能为空' })
  question!: string;

  @Matches(DATE_PATTERN, { message: '最晚决定日需为 YYYY-MM-DD 格式' })
  deadline!: string;

  @IsString()
  @IsNotEmpty({ message: '跟进人不能为空' })
  owner!: string;

  @IsString()
  decider!: string;

  @IsString()
  impact!: string;

  @IsString()
  @IsNotEmpty({ message: '决策状态不能为空' })
  @MaxLength(32, { message: '决策状态不能超过 32 个字符' })
  status!: string;

  @IsString()
  basis!: string;

  @IsString()
  conclusion!: string;
}

export class UpdateDecisionDto
  extends DecisionEditableFieldsDto
  implements UpdateDecisionRequest {}

export class CreateDecisionDto
  extends DecisionEditableFieldsDto
  implements CreateDecisionRequest {}
