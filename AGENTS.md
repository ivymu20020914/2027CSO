# 2027 CSO 全球可持续发展论坛 · 项目执行管理看板

## 应用概览

- 主体：2027 CSO 全球可持续发展论坛（主题「中国实践，向世界开源」），发起单位思盟企业社会责任促进中心，主办商道咨询，2027-01-14 上海浦东·良友大厦举办。
- 数据来源：`2027CSO论坛执行方案.xlsx`（18 sheet），已结构化为前端静态数据层。规模：322 项任务、59 条通知公告、25 项待确认决策、4 人核心团队、13 个执行模块、16 个关键里程碑。
- 数据边界（混合）：**任务 322、决策 25、公告 59 均为数据库驱动可协作**，落在 `forum_task` / `forum_decision` / `forum_notice` 表。任务支持登录用户**完整增删改**：新增（后端自动生成 `N###` 编号、唯一冲突重试）、全量编辑业务字段、删除（二次确认）、改状态，刷新/跨设备持久化并自动留痕更新人/时间；决策/公告支持**完整增删改**：新增（后端自动生成 `D##` / `N###` 编号，唯一冲突重试）、内容表单编辑 + 改状态（列表行与详情弹窗均可进入编辑）、删除（二次确认，校验生效行数），决策编辑领域/问题/最晚决定日/跟进与拍板人/判断依据/影响依赖/决定结论，公告编辑范围/标题/关联专项/三个日期/口径/对象/渠道/主责审批/要求动作/保密约束；保存后自动留痕（不展示 updatedBy）。方案内容随任务编辑/新增实时落库；**模块、团队、里程碑仍为前端静态只读**（TS 常量）。
- 选项扩展（`forum_option` 表）：模块 / 主责人 / 协作状态 / 优先级 / 公告范围 / 决策状态 均为「内置常量 + 团队自行补充」，补充值存 `forum_option`（`category` + `value` 唯一，模块类自动生成 `C01` 形式 `code` 作 moduleId，`moduleSheet` 存模块名），全团队共享；任务、公告、决策表单与状态编辑器均读同一份选项，列表/筛选同步显示新增值。
- 技术栈：React 19 + TS + Tailwind 4 + shadcn/ui + React Router v7 + ECharts + @tanstack/react-query；后端 NestJS 10 + Drizzle ORM + Postgres（`forum_task` 表，RLS 已启用）；图标仅 lucide-react；请求统一 axiosForBackend。

## 目录与架构

- `client/src/data/` 静态数据层（Python 由 Excel 生成，禁止手改数据内容）
  - `types.ts` 全部接口/联合类型/状态常量与中文标签
  - `project.ts` 项目元信息、13 模块、4 人团队、16 里程碑
  - `tasks.ts` / `decisions.ts` / `notices.ts` 原始方案存档（已不被运行时引用，仅作 DB 恢复数据源）
  - `selectors.ts` 统计/筛选/分组**纯函数**：任务类（moduleStats/ownerStats/taskStatusStats/filterTasks/tasksByModule）、公告/决策类（noticeScopeStats/noticesByModule/decisionsByDomain）均接收对应数据数组入参，不自行读静态数据；模块/里程碑/团队类仍内部读静态常量
- `client/src/hooks/useForumTasks.ts`（useQuery 拉全量 + useUpdateTaskStatus/useCreateTask/useUpdateTask/useDeleteTask 四个 mutation，retry:false、成功 invalidate）、`useForumDecisions.ts` / `useForumNotices.ts`（仅改状态）、`useForumOptions.ts`（拉取 `forum-options` + useCreateForumOption）
- `client/src/lib/forum-options.ts` `buildOptionGroups(options)` 合并内置常量与补充值产出 `OptionGroups`（modules/owners/statuses/priorities/noticeScopes/decisionStatuses），`findModule` 按 moduleId 查模块；`client/src/components/ui/creatable-select.tsx` 为「下拉 + ＋新增」复用控件（`category` 决定写入哪类选项，模块类回传生成的 moduleId）
- `server/modules/` NestJS 模块（controller/service/dto/module，模式一致）：`forum-task`（`GET /api/forum-tasks`、`POST` 创建、`PUT /api/forum-tasks/:taskId` 全量编辑、`PATCH .../status` 改状态、`DELETE .../:taskId`，写接口均 @NeedLogin、校验生效行数、写 updatedAt/updatedBy）、`forum-decision`（GET + POST 创建 + PUT `/:decisionId` 内容全量编辑 + PATCH 状态 + DELETE，三态）、`forum-notice`（GET + POST 创建 + PUT `/:noticeId` 内容全量编辑 + PATCH 状态 + DELETE，五态）、`forum-option`（GET 选项列表 + POST 新增选项）
- `shared/api.interface.ts` 前后端共享：TASK_STATUS_VALUES 五态、DECISION_STATUS_VALUES 三态、NOTICE_SCOPE_VALUES 三范围枚举 + 三类 DTO/请求响应类型 + 决策/公告可编辑字段契约（DecisionEditableFields / NoticeEditableFields）
- `client/src/components/blueprint/` 蓝图共享组件；`components/task/` 含 TaskTable、TaskDetailDialog（含编辑/删除入口）、TaskFormDialog（RHF+zod 新增/编辑复用，日期 Popover+Calendar）、TaskDeleteDialog（AlertDialog 二次确认）、TaskStatusEditor、TaskFilters、TaskTableSkeleton；`components/decision/` 含 DecisionDetailDialog + DecisionStatusEditor + DecisionFormDialog（内容编辑，RHF+zod）；`components/notice/` 含 NoticeTable（内含详情弹窗与行操作）、NoticeStatusEditor、NoticeFormDialog（内容编辑，RHF+zod）
- `client/src/pages/` 页面：`dashboard`(总览 `/`)、`tasks`(任务中心 `/tasks`)、`module-detail`(模块详情 `/modules/:moduleId`)、`notices`(公告 `/notices`)、`decisions`(决策风险 `/decisions`)、`team`(团队分工 `/team`)
- 聚合文件 `app.tsx` 路由、`Layout.tsx` 顶部导航由主 agent 维护；页面只读数据层，不自行造数据。

## 设计规范（企业蓝图报告风 · 唯一权威，附件蓝图）

### 场景约束
- 产品定位：四位核心成员在工位/投屏上统揽论坛全局进度与风险的「一页式企业评审报告」型工作台，像一本精密的项目评审蓝皮书，而不是堆砌卡片的通用后台。
- 应用类型：业务工具（高密度项目台账），信息密、克制、权威；视觉主角是任务状态分布与关键节点。
- 页面结构：顶部深蓝导航栏（品牌+6 个平级入口，模块多且平级）+ 各页内编号 Section（`01. SECTION NAME`）组织；不设侧栏。
- 应用身份：展示。顶栏左侧放论坛简称与主题，使用静态文案（数据层 project 常量），不接 useAppInfo。

### 视觉方向：蓝皮书评审台（内部代号，禁止出现在界面文案）
| 项 | 取值 | 用途 |
|---|---|---|
| 背景 bg | #F4F7F9 | 页面底色 |
| 卡片 surface | #FFFFFF | 报告卡片底 |
| 次级 muted | #F8FAFC | 辅助面板/表头底 |
| 正文 text | #1A1A1A | 主文字 |
| 次文字 | #94A3B8 | 标签/辅助/坐标文字 |
| 主色 accent | #0033A0 | 卡片顶边线、强调、主按钮、图表主色、链接 |
| 边框 border | #E2E8F0 | 0.5px 极细分隔线 |
| 成功 | #10B981 / 底 #ECFDF5 | 仅徽章/文字（已完成/达标） |
| 危险 | #EF4444 / 底 #FEF2F2 | 仅徽章/文字（高风险/阻塞） |
| 警告 | #F59E0B / 底 #FFFBEB | 仅徽章/文字（中风险/待审核、警告图标） |
| Header 渐变 | #001D4A→#0033A0→#004B93 | 顶栏/页头，右侧斜切几何块 |
| 图表色阶 | #0033A0 #0066FF #4D94FF #99C2FF #CCE0FF | 单色蓝五级，**任何图表填充只用蓝色阶**，语义色只进徽章/文字 |
| 字体 | Inter（妙搭镜像）+ 系统中文兜底；数字 font-mono 等宽 | 全局唯一字体族 |
| 圆角 | 卡片/Tooltip/图表容器 `rounded-none` 零圆角；徽章 rounded-sm(2px)/chip(4px)、时间线节点 rounded-full 为例外 | 企业精密感 |
| 阴影 | 统一 shadow-md 轻阴影 | 靠顶边线+细线分层，不用重阴影 |
| 字号 | 标签 9-11px font-black uppercase tracking-[0.15em]；KPI 值 text-xl；主标题 text-4xl/5xl | 极端字号对比建层级 |

### 硬性规则（违反即视觉不合格）
1. 任何白底卡片型组件必须 `rounded-none border-t-[3px] border-t-[#0033A0] shadow-md`（ReportCard 基座），KPI/结论/明细/风险卡复用，禁止省略/换色/改粗细。
2. 卡片、图表容器、Dialog/Tooltip 零圆角；仅徽章、标签、时间线节点、柱体顶部允许圆角。
3. 图表 ECharts 序列色仅单色蓝五级；风险/逾期类图表也不得用红绿，语义强调放旁边徽章/文字。
4. 分隔线一律 0.5px border 色（thin-border），除卡片 3px 顶边外禁止粗边框；阴影只 shadow-md。
5. 全大写标签统一 `font-black uppercase tracking-[0.15em]`；编号 Section 标题格式「01. 中文标题」+ 10px 英文/灰色副标题。
6. VerdictCard 为唯一深蓝底白字反转卡（结论/收尾区块）。
7. 颜色/字体/圆角只用 tailwind-theme.css 变量与全局类，禁止写死色值（蓝图专用 hex 已沉淀为变量/专用类）。

### 间距
- 容器 max-w-[1280px] mx-auto px-8；Section 间 space-y-8；网格 gap-8（大块 gap-10）；卡片内边距 p-6；页底 pb-20。
- 卡片内部并列元素用 gap 统一；父容器已给内边距子容器不叠加。

### 页面实现约束
- 金额/日期/编号/数值加 `.tnum`；页面主标题用 `.font-display`；入场用 `.rise`（尊重 prefers-reduced-motion）。
- 表格行 hover 仅加深底色（hover:bg-slate-50）不上浮；可点击卡片/按钮 hover 至少变两样（底色+边框或阴影）。
- 异步仅限静态 import（即时），不写 loading 骨架；空筛选结果给空态（说明原因+清除筛选入口）。
- 图标仅 lucide-react，尺寸随文字（12px 文字配 size-3/12，14 配 14，16 配 16）；纯图标按钮加 aria-label。
- 详情用 Dialog/Sheet，禁止 alert/confirm；长表格横向滚动，移动端网格垂直堆叠。
- 路由跳转用 Link/useNavigate，禁止 window.location；导航 NavLink active 高亮。

## 数据字典（关键字段）

- Task（静态基类）：taskId / moduleId / stage(阶段) / name / action(动作摘要) / startDate / endDate(YYYY-MM-DD) / owner / status / collaborators / reviewer / deliverable / priority(高|中|低)
- ForumTask（extends Task，运行时 DB 实体）：额外 `updatedAt`(ISO string) / `updatedBy`(string|null，妙搭 userId，前端仅展示更新时间不展示 ID)；任务/公告状态、决策状态、公告范围在类型上均为 `string`（内置值见 TASK_STATUS_VALUES / DECISION_STATUS_VALUES / NOTICE_SCOPES，可被 `forum_option` 补充值扩展，后端 DTO 已放宽为字符串校验）
- ForumDecision（extends Decision）/ ForumNotice（extends Notice）：同样额外携带 `updatedAt` / `updatedBy` 留痕字段；决策 status 为三态（待确认/已确认/已关闭），公告 status 复用任务五态
- Notice：noticeId / scope(对内|对外公开|对外定向) / moduleId / title / draftDate / approveDeadline / publishDate / frequency / audience / channel / keyMessage / owner / approver / requiredAction / status / confidentiality
- Decision：decisionId / domain(领域) / question / deadline / owner / decider / impact / status(待确认等) / basis / conclusion
- 状态常量、模块清单、团队、里程碑均从 `data/types.ts`、`data/project.ts` 导入，禁止在组件里另写取值数组。
