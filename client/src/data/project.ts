import type { ModuleInfo, TeamMember, Milestone, ProjectMeta } from './types';

export const MODULES: ModuleInfo[] = [
  { moduleId: "03", sheetName: "03_项目统筹与审批", name: "项目统筹与审批", owner: "吉宗元", total: 18, milestone: "11/18启动→1/13总验收", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "04", sheetName: "04_最佳实践案例征集", name: "最佳实践案例征集", owner: "俞璐", total: 52, milestone: "11/24征集→12/21截止→1/14公示", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "05", sheetName: "05_年度十大趋势", name: "年度十大趋势", owner: "俞璐", total: 27, milestone: "12月底定稿→1/14发布", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "06", sheetName: "06_主论坛与平行论坛", name: "主论坛与平行论坛", owner: "吉宗元", total: 28, milestone: "1/8议程官宣→1/14举办", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "07", sheetName: "07_CSO开源社区", name: "CSO开源社区", owner: "曹圣梓", total: 34, milestone: "1/9指南→1/13预热→1/14运营", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "08", sheetName: "08_合作伙伴与资源", name: "合作伙伴与资源", owner: "吉宗元", total: 19, milestone: "12月伙伴锁定→1/14履约", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "09", sheetName: "09_内容传播与公告", name: "内容传播与公告", owner: "曹圣梓", total: 27, milestone: "1/8预热→1/14爆发→1/20收官", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "10", sheetName: "10_视觉设计与物料", name: "视觉设计与物料", owner: "曹圣梓", total: 21, milestone: "11/23征集物料→1/8全场封版", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "11", sheetName: "11_场地布展与动线", name: "场地布展与动线", owner: "曹圣梓", total: 23, milestone: "11/24实勘→1/13搭建", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "12", sheetName: "12_嘉宾邀约与报名", name: "嘉宾邀约与报名", owner: "曹圣梓", total: 23, milestone: "12月开放报名→1/13会前通知", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "13", sheetName: "13_预算采购与供应商", name: "预算采购与供应商", owner: "吉宗元", total: 12, milestone: "11/27预算审批→1/13物资到位", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "14", sheetName: "14_现场运行与应急", name: "现场运行与应急", owner: "曹圣梓", total: 24, milestone: "1/11演练→1/14现场指挥", remark: "执行状态在对应专项Sheet维护" },
  { moduleId: "15", sheetName: "15_会后交付与复盘", name: "会后交付与复盘", owner: "吉宗元", total: 14, milestone: "1/15—1/20成果复盘归档", remark: "执行状态在对应专项Sheet维护" },
];

export const MILESTONES: Milestone[] = [
  { date: "2026-11-18", name: "项目启动/四人RACI", nature: "执行建议", requirement: "完成任务认领及对外审批链" },
  { date: "2026-11-23", name: "案例规则、公告、报名入口审核", nature: "执行建议", requirement: "案例发布前唯一必验节点" },
  { date: "2026-11-24", name: "案例征集公开首发", nature: "执行建议", requirement: "征集从11/24到12/21 18:00" },
  { date: "2026-12-02", name: "案例第一次对外提醒", nature: "执行建议", requirement: "公众号/社群/伙伴转发" },
  { date: "2026-12-09", name: "案例FAQ/中期传播", nature: "执行建议", requirement: "专业标准与材料说明" },
  { date: "2026-12-15", name: "案例最后一周提醒", nature: "执行建议", requirement: "强调截止日期和检查清单" },
  { date: "2026-12-18", name: "案例最后工作日提醒", nature: "执行建议", requirement: "精准催办、补件前置" },
  { date: "2026-12-21", name: "案例征集18:00截止", nature: "执行建议", requirement: "关表单锁库/备份" },
  { date: "2026-12-22", name: "案例材料补正/初审开始", nature: "执行建议", requirement: "与公开评审程序一致" },
  { date: "2026-12-31", name: "案例入选结果内部审定", nature: "执行建议", requirement: "名单严格保密" },
  { date: "2027-01-04", name: "入选企业非公开定向通知", nature: "执行建议", requirement: "1/4—1/6逐家确认" },
  { date: "2027-01-08", name: "正式议程与嘉宾集中预热", nature: "原方案传播阶段", requirement: "1/8—1/13预热" },
  { date: "2027-01-13", name: "现场搭建彩排/开源社区种草", nature: "原方案传播动作+执行建议", requirement: "全流程验收" },
  { date: "2027-01-14", name: "第十六届CSO论坛举办/趋势与案例发布", nature: "原方案明确", requirement: "上海浦东·良友大厦" },
  { date: "2027-01-15", name: "论坛重点回顾/趋势案例专题启动", nature: "原方案传播阶段", requirement: "合作伙伴媒体联动" },
  { date: "2027-01-20", name: "传播收官、项目复盘与档案整理", nature: "原方案传播截止+执行建议", requirement: "闭环统计和问题移交" },
];

export const TEAM: TeamMember[] = [
  { name: "李京", role: "总负责人（挂名）", core: "重大事项最终审批与资源协调", work: "重大预算/合作身份、评审结果、主旨关键嘉宾及重要对外声明拍板", approval: "不承担日常项目管理和逐条更新任务", notDo: "不作为每日执行交付的默认责任人", taskCount: 0, note: "按审批节点参与，不增加日常执行工作量" },
  { name: "吉宗元", role: "总统筹（核心执行指挥）", core: "项目总控、论坛内容、合作、品牌审核", work: "总进度、议程/嘉宾统筹、合作方、跨模块决策、设计定版、现场Run of Show", approval: "日常对外审核、跨组协调与风险升级；重大事项提交李京", notDo: "不默认兼任现场签到、各厅执行和所有社媒发布", taskCount: 111, note: "重要节点一岗一责，及时安排外部增援" },
  { name: "曹圣梓", role: "运营／CSO开源社区负责人", core: "社区四板块、社媒发布、会务、报名、现场布展", work: "开放麦、桌游、交换空间、循环实践；社媒排期、表单、物资、供应商协调、现场运营", approval: "对内通知、运营执行和发布截图、实物验收；专业内容由俞璐/吉宗元审核", notDo: "不独立决定案例评审结果、研究结论及重大合作权益", taskCount: 151, note: "社区明确由曹圣梓主责" },
  { name: "俞璐", role: "研究负责人", core: "2027年度十大趋势研究、案例征集专业评审执行", work: "趋势方法、专家调研、成果定稿、案例标准/收件复核/组织评审/成果专业审校", approval: "对专业数据、研究结论、案例真实性进行核查并提交吉宗元/李京审批", notDo: "不独立公开尚未批准的趋势结论与案例名单", taskCount: 60, note: "案例专业执行由俞璐牵头为本表工作建议，待内部确认" },
];

export const PROJECT: ProjectMeta = {
    "name": "2027 CSO全球可持续发展论坛",
    "theme": "中国实践，向世界开源",
    "organizer": "思盟企业社会责任促进中心",
    "host": "商道咨询",
    "location": "上海浦东·良友大厦",
    "startDate": "2026-11-18",
    "forumDate": "2027-01-14",
    "commsEndDate": "2027-01-20",
    "leaders": [
      {
        "label": "总负责人",
        "name": "李京"
      },
      {
        "label": "总统筹",
        "name": "吉宗元"
      },
      {
        "label": "社区/运营",
        "name": "曹圣梓"
      },
      {
        "label": "研究/案例",
        "name": "俞璐"
      }
    ],
    "totals": {
      "tasks": 322,
      "notices": 59,
      "decisions": 25,
      "modules": 13,
      "team": 4
    }
  };