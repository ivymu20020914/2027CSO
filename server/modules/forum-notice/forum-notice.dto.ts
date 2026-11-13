import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import type {
  CreateNoticeRequest,
  UpdateNoticeRequest,
  UpdateNoticeStatusRequest,
} from '@shared/api.interface';

export class UpdateNoticeStatusDto implements UpdateNoticeStatusRequest {
  @IsString()
  @IsNotEmpty({ message: '公告状态不能为空' })
  @MaxLength(32, { message: '公告状态不能超过 32 个字符' })
  status!: string;
}

// 空字符串或 YYYY-MM-DD；可空日期由前端传空串
const DATE_PATTERN = /^$|^\d{4}-\d{2}-\d{2}$/;

class NoticeEditableFieldsDto {
  @IsString()
  @IsNotEmpty({ message: '发布范围不能为空' })
  @MaxLength(32, { message: '发布范围不能超过 32 个字符' })
  scope!: string;

  @IsString()
  @IsNotEmpty({ message: '关联专项不能为空' })
  moduleId!: string;

  @IsString()
  moduleSheet!: string;

  @IsString()
  @IsNotEmpty({ message: '公告标题不能为空' })
  title!: string;

  @Matches(DATE_PATTERN, { message: '初稿日期需为 YYYY-MM-DD 格式' })
  draftDate!: string;

  @Matches(DATE_PATTERN, { message: '审批截止需为 YYYY-MM-DD 格式' })
  approveDeadline!: string;

  @Matches(DATE_PATTERN, { message: '发布日期需为 YYYY-MM-DD 格式' })
  publishDate!: string;

  @IsString()
  frequency!: string;

  @IsString()
  audience!: string;

  @IsString()
  channel!: string;

  @IsString()
  keyMessage!: string;

  @IsString()
  @IsNotEmpty({ message: '主责人不能为空' })
  owner!: string;

  @IsString()
  approver!: string;

  @IsString()
  requiredAction!: string;

  @IsString()
  @IsNotEmpty({ message: '公告状态不能为空' })
  @MaxLength(32, { message: '公告状态不能超过 32 个字符' })
  status!: string;

  @IsString()
  confidentiality!: string;
}

export class UpdateNoticeDto
  extends NoticeEditableFieldsDto
  implements UpdateNoticeRequest {}

export class CreateNoticeDto
  extends NoticeEditableFieldsDto
  implements CreateNoticeRequest {}
