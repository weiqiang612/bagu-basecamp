# TASK-001: 面试冲刺 UI/UX 极致优化

**Status**: Draft
**Created**: 2026-06-04
**Feature dir**: `docs/3-tasks/features/TASK-001-sprint-uiux-polish/`

## Objective
通过对仪表盘的视觉色彩、GSAP 3D 立体悬浮交互、倒计时燃尽对照以及局部占位骨架屏等 5 项核心 UI/UX 改造，强化复习冲刺期的警示感与体验闭环。

## Scope

### In scope
- 推荐列表卡片根据熟练度分值区间渲染红、黄、绿三色微光与对应的状态徽章。
- 鼠标在推荐卡片上悬浮移动时，触发 ≤ 3 度的 GSAP 3D 磁吸倾斜视差微交互。
- 卡片 Hover 时在右下角滑入显示暗示可跳转的 Obsidian 徽章。
- 在 `OverallProgress` 中提供极简天数输入与 localStorage 持久化，动态渲染燃尽对照虚线并在跑输时间线时让进度条进入高亮橙红警报状态。
- page 页面加载期间使用带有呼吸微光的局部骨架屏占位，并支持数据返回后的平滑淡入。

### Out of scope
- 卡片内部文字内容的在线 Markdown 编辑器（采用 Obsidian 穿透跳转实现）。
- 长期学习曲线数据归档及跨设备数据库同步。

## Acceptance criteria

```json
[
  {
    "id": "AC-001",
    "category": "functional",
    "description": "卡片熟练度区间着色与标签。低于40%为红色微光和 URGENT 标签；40%~80%为黄色/橙色微光和 DECAYING 标签；不低于80%为绿色微光和 STABLE 标签。",
    "steps": [
      "打开仪表盘页面，查看右侧推荐列表。",
      "若卡片得分小于40%，其卡片边框显现红色/紫色微光，且卡片内打上红色的 URGENT 标签。",
      "若卡片得分在40%至80%之间，边框显现橙黄色微光并标有 DECAYING 标签。",
      "若卡片得分不低于80%，边框显现青绿色微光并标有 STABLE 标签。"
    ],
    "passes": true
  },
  {
    "id": "AC-002",
    "category": "functional",
    "description": "实现推荐列表卡片的 GSAP 3D 磁吸倾斜（Card Tilt）与视差效果。",
    "steps": [
      "鼠标悬浮于推荐卡片上并移动指针，卡片应基于光标相对位置产生小于 3 度的三维轴向微幅倾斜旋转。",
      "当鼠标离开卡片区域时，卡片应顺滑复位，无瞬间跳变闪烁。"
    ],
    "passes": true
  },
  {
    "id": "AC-003",
    "category": "functional",
    "description": "整体进度燃尽对照线与跑输状态变换（支持自定义天数）。",
    "steps": [
      "打开 OverallProgress 卡片，点击右上角的微型设置按钮，输入总天数（例如15天）与已耗天数（例如5天），数据成功通过 localStorage 存储并记住。",
      "进度条上显示一根在已过去天数比例位置（例如 33.3%）的虚线。",
      "若卡片的总体复习完成率（例如 20%）落后于已消耗时间（33.3%），进度条发光转为橙红色；若超越，则为青绿色。"
    ],
    "passes": true
  },
  {
    "id": "AC-004",
    "category": "functional",
    "description": "卡片 Hover 时滑入展示 Obsidian 徽章。",
    "steps": [
      "当鼠标移入推荐列表卡片时，右下角顺滑滑出一个带有 Obsidian 标志性配色的小徽章，显示 'OPEN' 字符；移出时徽章淡出收起。"
    ],
    "passes": true
  },
  {
    "id": "AC-005",
    "category": "performance",
    "description": "局部骨架屏（Skeleton Loader）与平滑淡入逻辑。",
    "steps": [
      "在 `/api/progress` 数据请求加载期间，隐藏真实的图表与列表，展示同等布局的骨架占位卡片，其内部带有呼吸微光渐变效果。",
      "数据返回后，骨架屏渐隐，真实组件通过 GSAP 从 opacity 0 到 1 平滑淡入。"
    ],
    "passes": true
  }
]
```

## Notes
* 3D 磁吸倾斜需要考虑防抖和对 unmount 后的清理工作，避免造成内存泄露。
* 燃尽图的数据结构需考虑默认缺省值（如总天数 14 天，已消耗 0 天）。
