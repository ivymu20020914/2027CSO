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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@client/src/components/ui/popover';
import { Calendar } from '@client/src/components/ui/calendar';
import { CalendarClock } from 'lucide-react';
import { CreatableSelect } from '@client/src/components/ui/creatable-select';
import {
  useCreateTask,
  useUpdateTask,
} from '@client/src/hooks/useForumTasks';
import { useForumOptions } from '@client/src/hooks/useForumOptions';
import { findModule } from '@client/src/lib/forum-options';
import type { OptionGroups } from '@client/src/lib/forum-options';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import type { ForumTask } from '@client/src/api/forum-task';
import type {
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@shared/api.interface';

const taskFormSchema = z.object({
  moduleId: z.string().min(1, '请选择所属模块'),
  stage: z.string(),
  name: z.string().min(1, '任务名称不能为空'),
  action: z.string(),
  startDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  endDate: z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/, '日期格式不正确'),
  owner: z.string().min(1, '请选择主责人'),
  status: z.string().min(1, '请选择协作状态'),
  collaborators: z.string(),
  reviewer: z.string(),
  deliverable: z.string(),
  priority: z.string().min(1, '请选择优先级'),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  task: ForumTask | null;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const buildDefaults = (
  task: ForumTask | null,
  groups: OptionGroups,
): TaskFormData => ({
  moduleId: task?.moduleId ?? groups.modules[0]?.moduleId ?? '',
  stage: task?.stage ?? '',
  name: task?.name ?? '',
  action: task?.action ?? '',
  startDate: task?.startDate ?? '',
  endDate: task?.endDate ?? '',
  owner: task?.owner ?? groups.owners[0] ?? '',
  status: task?.status ?? '未开始',
  collaborators: task?.collaborators ?? '',
  reviewer: task?.reviewer ?? '',
  deliverable: task?.deliverable ?? '',
  priority: task?.priority ?? '中',
});

const inputClass =
  'h-9 rounded-none border-border text-[12px] shadow-none focus-visible:ring-[#0033A0]';

const selectTriggerClass =
  'h-9 rounded-none border-border text-[12px] shadow-none focus:ring-[#0033A0]';

const TaskFormDialog = ({ open, mode, task, onOpenChange, onSuccess }: TaskFormDialogProps) => {
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const { groups } = useForumOptions();
  const groupsRef = useRef<OptionGroups>(groups);
  groupsRef.current = groups;
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: buildDefaults(task, groups),
  });

  useEffect(() => {
    if (open) form.reset(buildDefaults(task, groupsRef.current));
  }, [open, task, form]);

  const pending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (data: TaskFormData): void => {
    const moduleSheet =
      findModule(groups.modules, data.moduleId)?.sheetName ?? '';
    if (mode === 'create') {
      const body: CreateTaskRequest = {
        moduleId: data.moduleId,
        moduleSheet,
        stage: data.stage,
        name: data.name,
        action: data.action,
        startDate: data.startDate,
        endDate: data.endDate,
        owner: data.owner,
        status: data.status,
        collaborators: data.collaborators,
        reviewer: data.reviewer,
        deliverable: data.deliverable,
        priority: data.priority,
      };
      createMutation.mutate(body, {
        onSuccess: (created) => {
          toast.success(`任务 ${created.taskId} 已创建`);
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: unknown) =>
          toast.error(getApiErrorMessage(error, '创建任务失败，请稍后重试')),
      });
      return;
    }
    if (!task) return;
    const body: UpdateTaskRequest = {
      moduleId: data.moduleId,
      moduleSheet,
      stage: data.stage,
      name: data.name,
      action: data.action,
      startDate: data.startDate,
      endDate: data.endDate,
      owner: data.owner,
      status: data.status,
      collaborators: data.collaborators,
      reviewer: data.reviewer,
      deliverable: data.deliverable,
      priority: data.priority,
    };
    updateMutation.mutate(
      { taskId: task.taskId, body },
      {
        onSuccess: () => {
          toast.success(`任务 ${task.taskId} 已更新`);
          onOpenChange(false);
          onSuccess?.();
        },
        onError: (error: unknown) =>
          toast.error(getApiErrorMessage(error, '编辑任务失败，请稍后重试')),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none border-t-[3px] border-t-[#0033A0] p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border p-6 pb-4">
          <DialogTitle className="text-base font-extrabold text-slate-900">
            {mode === 'create' ? '新增任务' : `编辑任务 ${task?.taskId ?? ''}`}
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
                name="moduleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      所属模块 <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <CreatableSelect
                      category="module"
                      label="模块"
                      value={field.value}
                      options={groups.modules.map((m) => ({
                        value: m.moduleId,
                        label: `${m.moduleId} · ${m.name}`,
                      }))}
                      onChange={field.onChange}
                      placeholder="选择模块"
                      triggerClassName={selectTriggerClass}
                      ariaLabel="所属模块"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      options={groups.owners.map((o) => ({ value: o, label: o }))}
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
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>阶段</FormLabel>
                    <FormControl>
                      <Input className={inputClass} placeholder="如：启动与责任" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>优先级</FormLabel>
                    <CreatableSelect
                      category="priority"
                      label="优先级"
                      value={field.value}
                      options={groups.priorities.map((p) => ({
                        value: p,
                        label: `${p}优先`,
                      }))}
                      onChange={field.onChange}
                      placeholder="选择优先级"
                      triggerClassName={selectTriggerClass}
                      ariaLabel="优先级"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      任务名称 <span aria-hidden="true" className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className={inputClass} placeholder="请输入任务名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>具体动作</FormLabel>
                    <FormControl>
                      <Textarea
                        className="rounded-none border-border text-[12px] shadow-none focus-visible:ring-[#0033A0]"
                        rows={3}
                        placeholder="描述任务的具体执行动作"
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>开始日期</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`${inputClass} justify-start font-normal`}
                              aria-label="选择开始日期"
                            >
                              <CalendarClock className="size-3.5 text-[#94A3B8]" />
                              {field.value ? dayjs(field.value).format('YYYY/MM/DD') : '选择日期'}
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>完成节点</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`${inputClass} justify-start font-normal`}
                              aria-label="选择完成日期"
                            >
                              <CalendarClock className="size-3.5 text-[#94A3B8]" />
                              {field.value ? dayjs(field.value).format('YYYY/MM/DD') : '选择日期'}
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
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>协作状态</FormLabel>
                      <CreatableSelect
                        category="status"
                        label="协作状态"
                        value={field.value}
                        options={groups.statuses.map((s) => ({
                          value: s,
                          label: s,
                        }))}
                        onChange={field.onChange}
                        placeholder="选择状态"
                        triggerClassName={selectTriggerClass}
                        ariaLabel="协作状态"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reviewer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>审核/决策人</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="审核或决策人" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="collaborators"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>协同人</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="协同人员" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliverable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>验收交付物</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="交付物名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                取消
              </Button>
              <Button writeAction
                type="submit"
                size="sm"
                className="rounded-none bg-[#0033A0] text-white hover:bg-[#00247D]"
                disabled={pending}
              >
                {pending ? '保存中…' : mode === 'create' ? '创建任务' : '保存修改'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { TaskFormDialog };
