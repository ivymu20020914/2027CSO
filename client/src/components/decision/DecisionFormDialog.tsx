import { useEffect, useRef } from 'react';
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
  CreatableSelect,
  type CreatableOption,
} from '@client/src/components/ui/creatable-select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@client/src/components/ui/popover';
import { Calendar } from '@client/src/components/ui/calendar';
import { CalendarClock } from 'lucide-react';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import {
  useCreateDecision,
  useUpdateDecision,
} from '@client/src/hooks/useForumDecisions';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import type { ForumDecision } from '@client/src/api/forum-decision';
import type { CreateDecisionRequest } from '@shared/api.interface';

const decisionFormSchema = z.object({
  domain: z.string().min(1, '决策领域不能为空'),
  question: z.string().min(1, '决策问题不能为空'),
  deadline: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  owner: z.string().min(1, '请选择跟进人'),
  decider: z.string(),
  impact: z.string(),
  status: z.string().min(1, '请选择决策状态'),
  basis: z.string(),
  conclusion: z.string(),
});

type DecisionFormData = z.infer<typeof decisionFormSchema>;

interface DecisionFormDialogProps {
  open: boolean;
  decision: ForumDecision | null;
  onOpenChange: (open: boolean) => void;
}

const buildDefaults = (
  decision: ForumDecision | null,
  defaultOwner: string,
): DecisionFormData => ({
  domain: decision?.domain ?? '',
  question: decision?.question ?? '',
  deadline: decision?.deadline ?? '',
  owner: decision?.owner ?? defaultOwner,
  decider: decision?.decider ?? '',
  impact: decision?.impact ?? '',
  status: decision?.status ?? '待确认',
  basis: decision?.basis ?? '',
  conclusion: decision?.conclusion ?? '',
});

const inputClass =
  'h-9 rounded-none border-border text-[12px] shadow-none focus-visible:ring-[#0033A0]';
const selectTriggerClass =
  'h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]';
const textareaClass =
  'rounded-none border-border text-[12px] shadow-none focus-visible:ring-[#0033A0]';

const DecisionFormDialog = ({
  open,
  decision,
  onOpenChange,
}: DecisionFormDialogProps) => {
  const updateMutation = useUpdateDecision();
  const createMutation = useCreateDecision();
  const isPending: boolean =
    updateMutation.isPending || createMutation.isPending;
  const { groups } = useForumOptions();
  const defaultOwner: string = groups.owners[0] ?? '';
  const defaultOwnerRef = useRef<string>(defaultOwner);
  defaultOwnerRef.current = defaultOwner;
  const statusOptions: CreatableOption[] = groups.decisionStatuses.map(
    (s: string) => ({ value: s, label: s }),
  );
  const ownerOptions: CreatableOption[] = groups.owners.map((name: string) => ({
    value: name,
    label: name,
  }));
  const form = useForm<DecisionFormData>({
    resolver: zodResolver(decisionFormSchema),
    defaultValues: buildDefaults(decision, defaultOwner),
  });

  useEffect(() => {
    if (open) form.reset(buildDefaults(decision, defaultOwnerRef.current));
  }, [open, decision, form]);

  const handleSubmit = (data: DecisionFormData): void => {
    const body: CreateDecisionRequest = {
      domain: data.domain,
      question: data.question,
      deadline: data.deadline,
      owner: data.owner,
      decider: data.decider,
      impact: data.impact,
      status: data.status,
      basis: data.basis,
      conclusion: data.conclusion,
    };
    if (decision) {
      updateMutation.mutate(
        { decisionId: decision.decisionId, body },
        {
          onSuccess: () => {
            toast.success(`决策 ${decision.decisionId} 已更新`);
            onOpenChange(false);
          },
          onError: (error: unknown) =>
            toast.error(getApiErrorMessage(error, '编辑决策失败，请稍后重试')),
        },
      );
      return;
    }
    createMutation.mutate(body, {
      onSuccess: (created: ForumDecision) => {
        toast.success(`决策 ${created.decisionId} 已创建`);
        onOpenChange(false);
      },
      onError: (error: unknown) =>
        toast.error(getApiErrorMessage(error, '创建决策失败，请稍后重试')),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-t-[3px] border-t-[#0033A0] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-6 pb-4">
          <DialogTitle className="text-base font-extrabold text-slate-900">
            {decision ? `编辑决策 ${decision.decisionId}` : '新增决策'}
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
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      决策领域 <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={inputClass} placeholder="如：场地 / 议程 / 预算" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>决策状态</FormLabel>
                    <FormControl>
                      <CreatableSelect
                        category="decision_status"
                        label="决策状态"
                        value={field.value}
                        options={statusOptions}
                        onChange={field.onChange}
                        placeholder="选择状态"
                        ariaLabel="决策状态"
                        triggerClassName={selectTriggerClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      决策问题 <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={2}
                        placeholder="需要拍板的具体问题"
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
                        跟进人 <span aria-hidden="true" className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <CreatableSelect
                          category="owner"
                          label="跟进人"
                          value={field.value}
                          options={ownerOptions}
                          onChange={field.onChange}
                          placeholder="选择跟进人"
                          ariaLabel="跟进人"
                          triggerClassName={selectTriggerClass}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="decider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>拍板人</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="拍板/审批人" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>最晚决定日</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`${inputClass} justify-start font-normal`}
                            aria-label="选择最晚决定日"
                          >
                            <CalendarClock className="size-3.5 text-[#94A3B8]" />
                            {field.value
                              ? dayjs(field.value).format('YYYY/MM/DD')
                              : '选择日期'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto rounded-none p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? dayjs(field.value).toDate() : undefined}
                          onSelect={(d) =>
                            field.onChange(d ? dayjs(d).format('YYYY-MM-DD') : '')
                          }
                        />
                        <div className="flex justify-end border-t border-border p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-none text-[11px] text-[#94A3B8]"
                            onClick={() => field.onChange('')}
                          >
                            清除
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>判断依据</FormLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={2}
                        placeholder="方案依据、前置条件或约束"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="impact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>影响与依赖</FormLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={2}
                        placeholder="不决策会影响哪些事项"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="conclusion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>决定结论</FormLabel>
                    <FormControl>
                      <Textarea
                        className={textareaClass}
                        rows={3}
                        placeholder="拍板后的结论与落实要求"
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
                {isPending
                  ? decision
                    ? '保存中…'
                    : '创建中…'
                  : decision
                    ? '保存修改'
                    : '创建决策'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { DecisionFormDialog };
