import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@shared/api.interface';

export class UpdateTaskStatusDto implements UpdateTaskStatusRequest {
  @IsString()
  @IsNotEmpty({ message: '协作状态不能为空' })
  @MaxLength(32, { message: '协作状态不能超过 32 个字符' })
  status!: string;
}

// 空字符串或 YYYY-MM-DD；可空日期由前端传空串
const DATE_PATTERN = /^$|^\d{4}-\d{2}-\d{2}$/;

class TaskEditableFieldsDto {
  @IsString()
  @IsNotEmpty({ message: '所属模块不能为空' })
  @MaxLength(16, { message: '模块编号不能超过 16 个字符' })
  moduleId!: string;

  @IsString()
  moduleSheet!: string;

  @IsString()
  stage!: string;

  @IsString()
  @IsNotEmpty({ message: '任务名称不能为空' })
  name!: string;

  @IsString()
  action!: string;

  @Matches(DATE_PATTERN, { message: '开始日期需为 YYYY-MM-DD 格式' })
  startDate!: string;

  @Matches(DATE_PATTERN, { message: '结束日期需为 YYYY-MM-DD 格式' })
  endDate!: string;

  @IsString()
  @IsNotEmpty({ message: '主责人不能为空' })
  owner!: string;

  @IsString()
  @IsNotEmpty({ message: '协作状态不能为空' })
  @MaxLength(32, { message: '协作状态不能超过 32 个字符' })
  status!: string;

  @IsString()
  collaborators!: string;

  @IsString()
  reviewer!: string;

  @IsString()
  deliverable!: string;

  @IsString()
  @IsNotEmpty({ message: '优先级不能为空' })
  @MaxLength(16, { message: '优先级不能超过 16 个字符' })
  priority!: string;
}

export class CreateTaskDto
  extends TaskEditableFieldsDto
  implements CreateTaskRequest {}

export class UpdateTaskDto
  extends TaskEditableFieldsDto
  implements UpdateTaskRequest {}
