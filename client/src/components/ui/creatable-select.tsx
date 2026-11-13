import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@client/src/components/ui/dialog';
import { useCreateForumOption } from '@client/src/hooks/useForumOptions';
import { getApiErrorMessage } from '@client/src/lib/api-error';
import type { ForumOptionDTO, OptionCategory } from '@shared/api.interface';

export interface CreatableOption {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  category: OptionCategory;
  label: string;
  value: string;
  options: CreatableOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  triggerClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
  /** 覆盖默认的「全量选项」占位项，如筛选用「全部主责」 */
  leadingOption?: CreatableOption;
}

const CreatableSelect = ({
  category,
  label,
  value,
  options,
  onChange,
  placeholder,
  triggerClassName = '',
  ariaLabel,
  disabled = false,
  leadingOption,
}: CreatableSelectProps) => {
  const createMutation = useCreateForumOption();
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>('');
  const [createdOptions, setCreatedOptions] = useState<CreatableOption[]>([]);
  const [innerValue, setInnerValue] = useState<string>(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  const mergedOptions: CreatableOption[] = [...options];
  for (const item of createdOptions) {
    if (!mergedOptions.some((option: CreatableOption) => option.value === item.value)) {
      mergedOptions.push(item);
    }
  }

  const safeValue: string = innerValue ?? '';
  const selectedLabel: string | undefined =
    mergedOptions.find((option: CreatableOption) => option.value === safeValue)
      ?.label ?? (safeValue.length > 0 ? safeValue : undefined);

  const handleValueChange = (next: string): void => {
    setInnerValue(next);
    onChange(next);
  };

  const handleCreate = (): void => {
    const next: string = draft.trim();
    if (next.length === 0) {
      toast.error(`请填写${label}名称`);
      return;
    }
    createMutation.mutate(
      { category, value: next },
      {
        onSuccess: (option: ForumOptionDTO | undefined) => {
          const moduleCode: string = option?.code || '';
          const created: string =
            category === 'module' ? moduleCode : next;
          setDraft('');
          setCreateOpen(false);
          if (!created) {
            toast.success(`${label}「${next}」已新增，请在列表中选择`);
            return;
          }
          const createdLabel: string =
            category === 'module' ? `${created} · ${next}` : created;
          setCreatedOptions((prev: CreatableOption[]) => [
            ...prev,
            { value: created, label: createdLabel },
          ]);
          setInnerValue(created);
          onChange(created);
          toast.success(`${label}「${next}」已新增`);
        },
        onError: (error: unknown) =>
          toast.error(getApiErrorMessage(error, `${label}新增失败，请稍后重试`)),
      },
    );
  };

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={safeValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          className={`min-w-0 flex-1 ${triggerClassName}`}
          aria-label={ariaLabel ?? label}
        >
          <SelectValue placeholder={placeholder ?? `选择${label}`}>
            {selectedLabel}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {leadingOption && (
            <SelectItem value={leadingOption.value}>
              {leadingOption.label}
            </SelectItem>
          )}
          {mergedOptions.map((option: CreatableOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button writeAction
        type="button"
        variant="outline"
        size="icon"
        className="size-9 shrink-0 rounded-none border-border text-[#0033A0] shadow-none hover:border-[#0033A0] hover:bg-[#CCE0FF]/40"
        aria-label={`新增${label}`}
        onClick={() => setCreateOpen(true)}
        disabled={disabled}
      >
        <Plus className="size-3.5" />
      </Button>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-none border-t-[3px] border-t-[#0033A0] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900">
              新增{label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`请输入${label}名称`}
              aria-label={`${label}名称`}
              maxLength={64}
              className="h-9 rounded-none border-border text-[12px] shadow-none focus-visible:ring-[#0033A0]"
            />
            <p className="text-[10px] font-medium text-[#94A3B8]">
              新增后立即出现在本表单与筛选中，团队成员共用。
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-none"
              onClick={() => setCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              取消
            </Button>
            <Button writeAction
              type="button"
              size="sm"
              className="rounded-none bg-[#0033A0] text-white hover:bg-[#00247D]"
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? '保存中…' : '确认新增'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { CreatableSelect };
