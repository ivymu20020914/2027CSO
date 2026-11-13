import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@client/src/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/src/components/ui/form';
import { Input } from '@client/src/components/ui/input';
import { Textarea } from '@client/src/components/ui/textarea';
import { Button } from '@client/src/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@client/src/components/ui/popover';
import { Calendar } from '@client/src/components/ui/calendar';
import { CreatableSelect } from '@client/src/components/ui/creatable-select';
import { CalendarClock } from 'lucide-react';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import { findModule } from '@client/src/lib/forum-options';
import type { OptionGroups } from '@client/src/lib/forum-options';
import {
  useCreateNotice,
  useUpdateNotice,
} from '@client/src/hooks/useForumNotices';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import type { ModuleInfo } from '@client/src/data/types';
import type { ForumNotice } from '@client/src/api/forum-notice';
import type { UpdateNoticeRequest } from '@shared/api.interface';

const noticeFormSchema = z.object({
  scope: z.string().min(1, '请选择发布范围'),
  moduleId: z.string().min(1, '请选择关联专项'),
  title: z.string().min(1, '公告标题不能为空'),
  draftDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  approveDeadline: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  publishDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  frequency: z.string(),
  audience: z.string(),
  channel: z.string(),
  keyMessage: z.string(),
  owner: z.string().min(1, '请选择主责人'),
  approver: z.string(),
  requiredAction: z.string(),
  status: z.string().min(1, '请选择公告状态'),
  confidentiality: z.string(),
});

type NoticeFormData = z.infer<typeof noticeFormSchema>;

interface NoticeFormDialogProps {
  open: boolean;
  notice: ForumNotice | null;
  onOpenChange: (open: boolean) => void;
}

interface CreatableOptionItem {
  value: string;
  label: string;
}

const buildDefaults = (
  notice: ForumNotice | null,
  groups: OptionGroups,
): NoticeFormData => ({
  scope: notice?.scope || '对内',
  moduleId: notice?.moduleId || groups.modules[0]?.moduleId || '',
  title: notice?.title ?? '',
  draftDate: notice?.draftDate ?? '',
  approveDeadline: notice?.approveDeadline ?? '',
  publishDate: notice?.publishDate ?? '',
  frequency: notice?.frequency ?? '',
  audience: notice?.audience ?? '',
  channel: notice?.channel ?? '',
  keyMessage: notice?.keyMessage ?? '',
  owner: notice?.owner || groups.owners[0] || '',
  approver: notice?.approver ?? '',
  requiredAction: notice?.requiredAction ?? '',
  status: notice?.status || '未开始',
  confidentiality: notice?.confidentiality ?? '',
});

const inputClass =
  'h-9 rounded-none border-border text-[12px] shadow-none focus-visible:ring-[#0033A0]';
const textareaClass =
  'rounded-none border-border text-[12px] shadow-none focus-visible:ring-[#0033A0]';
const selectTriggerClass =
  'h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]';

interface DateFieldProps {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
}

const DateField = ({ label, ariaLabel, value, onChange }: DateFieldProps) => (
  <FormItem className="flex flex-col">
    <FormLabel>{label}</FormLabel>
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={`${inputClass} justify-start font-normal`}
            aria-label={ariaLabel}
          >
            <CalendarClock className="size-3.5 text-[#94A3B8]" />
            {value ? dayjs(value).format('YYYY/MM/DD') : '选择日期'}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-none p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? dayjs(value).toDate() : undefined}
          onSelect={(d) => onChange(d ? dayjs(d).format('YYYY-MM-DD') : '')}
        />
        <div className="flex justify-end border-t border-border p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-none text-[11px] text-[#94A3B8]"
            onClick={() => onChange('')}
          >
            清除
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    <FormMessage />
  </FormItem>
);

const NoticeFormDialog = ({
  open,
  notice,
  onOpenChange,
}: NoticeFormDialogProps) => {
  const updateMutation = useUpdateNotice();
  const createMutation = useCreateNotice();
  const isPending: boolean = updateMutation.isPending || createMutation.isPending;
  const { groups } = useForumOptions();
  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeFormSchema),
    defaultValues: buildDefaults(notice, groups),
  });

  const scopeOptions: CreatableOptionItem[] = groups.noticeScopes.map(
    (s: string): CreatableOptionItem => ({ value: s, label: s }),
  );
  const statusOptions: CreatableOptionItem[] = groups.statuses.map(
    (s: string): CreatableOptionItem => ({ value: s, label: s }),
  );
  const ownerOptions: CreatableOptionItem[] = groups.owners.map(
    (o: string): CreatableOptionItem => ({ value: o, label: o }),
  );
  const moduleOptions: CreatableOptionItem[] = groups.modules.map(
    (m: ModuleInfo): CreatableOptionItem => ({
      value: m.moduleId,
      label: `${m.moduleId} · ${m.name}`,
    }),
  );

  useEffect(() => {
    if (open) form.reset(buildDefaults(notice, groups));
  }, [open, notice, form]);

  const handleSubmit = (data: NoticeFormData): void => {
    const moduleSheet =
      findModule(groups.modules, data.moduleId)?.sheetName ?? '';
    const body: UpdateNoticeRequest = {
      scope: data.scope,
      moduleId: data.moduleId,
      moduleSheet,
      title: data.title,
      draftDate: data.draftDate,
      approveDeadline: data.approveDeadline,
      publishDate: data.publishDate,
      frequency: data.frequency,
      audience: data.audience,
      channel: data.channel,
      keyMessage: data.keyMessage,
      owner: data.owner,
      approver: data.approver,
      requiredAction: data.requiredAction,
      status: data.status,
      confidentiality: data.confidentiality,
    };
    if (!notice) {
      createMutation.mutate(body, {
        onSuccess: (created: ForumNotice) => {
          toast.success(`公告 ${created.noticeId} 已创建`);
          onOpenChange(false);
        },
        onError: (error: unknown) =>
          toast.error(getApiErrorMessage(error, '创建公告失败，请稍后重试')),
      });
      return;
    }
    updateMutation.mutate(
      { noticeId: notice.noticeId, body },
      {
        onSuccess: () => {
          toast.success(`公告 ${notice.noticeId} 已更新`);
          onOpenChange(false);
        },
        onError: (error: unknown) =>
          toast.error(getApiErrorMessage(error, '编辑公告失败，请稍后重试')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-t-[3px] border-t-[#0033A0] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-6 pb-4">
          <DialogTitle className="text-base font-extrabold text-slate-900">
            {notice ? `编辑公告 ${notice.noticeId}` : '新增公告'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="max-h-[65vh] overflow-y-auto px-6 py-4"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>发布范围</FormLabel>
                    <CreatableSelect
                      category="notice_scope"
                      label="发布范围"
                      value={field.value}
                      options={scopeOptions}
                      onChange={field.onChange}
                      placeholder="选择范围"
                      triggerClassName={selectTriggerClass}
                      ariaLabel="发布范围"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公告状态</FormLabel>
                    <CreatableSelect
                      category="status"
                      label="公告状态"
                      value={field.value}
                      options={statusOptions}
                      onChange={field.onChange}
                      placeholder="选择状态"
                      triggerClassName={selectTriggerClass}
                      ariaLabel="公告状态"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      公告标题 <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={inputClass} placeholder="请输入公告标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      关联专项 <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <CreatableSelect
                      category="module"
                      label="模块"
                      value={field.value}
                      options={moduleOptions}
                      onChange={field.onChange}
                      placeholder="选择专项"
                      triggerClassName={selectTriggerClass}
                      ariaLabel="关联专项"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="draftDate"
                  render={({ field }) => (
                    <DateField
                      label="初稿日期"
                      ariaLabel="选择初稿日期"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="approveDeadline"
                  render={({ field }) => (
                    <DateField
                      label="审批最晚"
                      ariaLabel="选择审批最晚日期"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="publishDate"
                  render={({ field }) => (
                    <DateField
                      label="正式发布"
                      ariaLabel="选择发布日期"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="keyMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>核心口径</FormLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={3}
                        placeholder="本次公告必须传达的核心信息"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        主责人 <span aria-hidden="true" className="text-destructive">*</span>
                      </FormLabel>
                      <CreatableSelect
                        category="owner"
                        label="主责人"
                        value={field.value}
                        options={ownerOptions}
                        onChange={field.onChange}
                        placeholder="选择主责人"
                        triggerClassName={selectTriggerClass}
                        ariaLabel="主责人"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="approver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>审批人</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="审批人" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="audience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发布对象</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="面向哪些人群" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>发布渠道</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="公众号 / 飞书群 / 邮件" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>发布周期</FormLabel>
                    <FormControl>
                      <Input className={inputClass} placeholder="如：11/24—12/21 每周五跟踪" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requiredAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>要求动作</FormLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={2}
                        placeholder="希望读者完成什么动作"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confidentiality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>约束/保密</FormLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={2}
                        placeholder="保密要求或发布约束"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                取消
              </Button>
              <Button writeAction
                type="submit"
                size="sm"
                className="rounded-none bg-[#0033A0] text-white hover:bg-[#00247D]"
                disabled={isPending}
              >
                {isPending ? '保存中…' : notice ? '保存修改' : '创建公告'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { NoticeFormDialog };
