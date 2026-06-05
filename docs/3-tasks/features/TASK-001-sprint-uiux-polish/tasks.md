# TASK-001: Tasks

**Spec**: `spec.md`
**Status**: In Progress

## Key decisions
- **GSAP 3D Card Tilt 角度限制**：在 RecommendationList 卡片悬浮中限制偏转角在最大 3 度，通过对光标坐标归一化并结合 `gsap.to()` 进行平滑移动。
- **自定义天数输入持久化**：在 OverallProgress 卡片右上角设置小齿轮弹窗，通过 React 状态和 `localStorage` 动态保存“总天数”和“已过去天数”，用于生成虚线并决定是否警报。
- **局部骨架呼吸屏**：重构 page.tsx，使用 CSS 动效和 Flex/Grid 绘制出和原仪表盘形状一致的骨架屏（Skeleton）在请求接口时占位，加载成功后使用 GSAP 优雅切换。

## Progress

- [ ] T1 — 状态与存储定义：在 `OverallProgress.tsx` 中定义冲刺设置状态类型及 `localStorage` 存取加载机制 · covers: AC-003
- [ ] T2 — CSS 设计系统扩展：在 `globals.css` 中添加红/黄/绿警示微光变量、Obsidian 徽章类及骨架屏呼吸动画 `@keyframes` · covers: AC-001, AC-005
- [ ] T3 — 状态警示与 Obsidian 唤醒徽章：修改 `RecommendationList.tsx`，根据卡片 `score` 渲染对应的微光背景与标签，并添加 Hover 时滑出的 Obsidian 唤醒小徽章 · covers: AC-001, AC-004
- [ ] T4 — GSAP 3D 磁吸倾斜：修改 `RecommendationList.tsx`，引入 Ref 监听卡片 Hover 坐标，用 GSAP 实现微距 3D 视差倾斜动画与复位清理 · covers: AC-002
- [ ] T5 — 燃尽对照条与设置面板：修改 `OverallProgress.tsx`，添加设置小齿轮展开框，计算并渲染燃尽虚线与落后时的警报色变换 · covers: AC-003
- [ ] T6 — 局部占位骨架屏与淡入切换：修改 `page.tsx`，在 loading 态时渲染呼吸微光骨架卡片群，请求成功后通过 GSAP 完成骨架淡出与真实界面的平滑淡入 · covers: AC-005
- [ ] T7 — 运行 `npm run lint` — 全项目静态检查确保无类型与编译错误
- [ ] T8 — 验证 ACs：在 `spec.md` 中将通过的 AC `passes` 更新为 `true`
- [ ] T9 — 运行 `npm run lint` — 无格式冲突与风格规范违规
- [ ] T10 — 更新 `docs/3-tasks/CURRENT_PLAN.md` — 标记本任务完成

## Dependencies
- T3, T4, T5 require T1, T2
- T6, T7, T8, T9 require T1–T5
- T10 requires T7–T9

## Blockers
_None_
