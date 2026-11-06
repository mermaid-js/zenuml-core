# 学习 Claude 前端细节处理 → @zenuml/core 改造计划

> 2026-10-19：已用 Claude 真实 CSS 核对本计划，见 [open-claude-ui v2 评估](2026-10-19-open-claude-ui-v2-assessment.md)；计划修订见文末「2026-10-19 修订」。第一节 D4/D5/D7 的数值已被取代，以修订为准。本次对第一节只加了这段说明和「站点自身缺陷」里的一条 2026-10-19 注记，其余内容未改。

日期 2026-10-14。来源：https://claude-storybook.bystanderss.chatgpt.site/ （Claude.app 设计细节拆解页）。
证据：`evidence/detail-catalogue.md`（站点 2533 行逐条拆解，含行号）、`evidence/zenuml-ui-audit.md`（本仓库现状，含 file:line）；仓库内逐条目录见 [2026-10-14-claude-frontend-details-catalogue.md](2026-10-14-claude-frontend-details-catalogue.md)。

## 一、Claude 细节手法：12 条核心

| # | 手法 | 具体做法 | 背后原理 |
|---|---|---|---|
| D1 | 动效时长分级 | 60 / 120 / 200 / 300 / 450 ms 五档，按用途选：图标变色 60，Tab 切换 120，菜单弹出 200，侧栏 300，大面积色变 450 | 越小的元素越快；用户不等动画 |
| D2 | 三条缓动曲线 | `out` = `cubic-bezier(.165,.84,.44,1)`（平滑减速）；`snap` = `(.32,.72,0,1)`（快起、干脆锁定）；`overshoot` = `(.34,1.3,.64,1)`（1.3 倍微回弹） | 不用默认 `ease`；入场减速，选中锁定，出现轻弹 |
| D3 | 入场 = 透明度 + 小位移 + 小缩放 | 气泡：`opacity 0, scale(.92) translateY(6px)` → none，450ms overshoot。块：前 30% 先位移缩放到位（仍隐藏），后 70% 去模糊淡入 | 位移只 5–10px，缩放 0.9–0.92；动作小，感觉"浮上来"而非"飞进来" |
| D4 | 双层阴影 + inset 发丝线代替 border | 静止：`0 4px 20px rgba(0,0,0,.035), inset 0 0 0 1px rgba(0,0,0,.08)`。聚焦：外影加深到 .075，内环 .16，再加 1px 外环 .16，200ms 过渡 | 不用硬 1px 黑边；焦点状态"整个容器变实"，不是给输入框画框 |
| D5 | 阴影阶梯 | SM `0 1px 2px .05 + 0 2px 8px .04`；MD `0 2px 4px .06 + 0 6px 16px .07`；Popover `0 8px 24px .12 + 0 2px 6px .08`。暗色只用一层更浓阴影 | 紧影给边缘，散影给高度；三档够用 |
| D6 | 尺寸阶梯与圆角随尺寸增长 | 控件高 24 / 28 / 32 / 40；圆角 md / lg / lg / xl；图标 12 / 14 / 16 / 20 / 24 | 多行控件对齐；大控件大圆角 |
| D7 | 按下反馈 | `active:scale-95`；或弹簧：按下 0.88，松开 stiffness 600 / damping 30 回弹 | 每次点击都有物理回应 |
| D8 | 光学对齐 | 行内图标 `vertical-align:-0.125em`（小字 -0.075em）；标题 `text-wrap:balance`；正文 `text-wrap:pretty`；长 token `overflow-wrap:anywhere` + `word-break:normal`；变化数字 `tabular-nums` | 几何居中 ≠ 视觉居中；不留单字孤行；长 id 不撑破、普通单词不被拆 |
| D9 | 折叠用 `grid-template-rows: 0fr ↔ 1fr` | 子元素 `min-h-0 overflow-hidden`，200ms，`(.19,1,.22,1)` | 不需 JS 量高度即可平滑展开 |
| D10 | 成功反馈有时限 | 复制后图标 copy→check + "Copied"，2.5s 后 300ms 淡出 | 告诉用户成功，然后自己消失 |
| D11 | 滑块按几何计算 | 分段控件胶囊 `left: calc(2px + i*(100%-4px)/n)`，150ms snap 曲线 | 无测量、无抖动、像素贴合 |
| D12 | 暗色字重补偿 | 暗色下可变字体 wght 500→460，600→560 | 浅字深底看起来更粗 |

站点自身缺陷（学原理，别抄错）：
- 无 `prefers-reduced-motion`、无 `:focus-visible`、无 aria → 我们要比它做得好。（2026-10-19：此条描述的是 storybook 站点，不是 Claude 本身；Claude 网页 CSS 有 80 个 `prefers-reduced-motion: reduce` 块和 16 个 `no-preference` 块（共 96 个），见评估 §a）
- 复制对勾：`setTimeout 2500` 与淡出起点同时卸载，淡出看不到 → 状态复位应在 ~2.8s。
- `grid 0fr` 子元素带 padding 会漏一条 → padding 放内层。
- `vertical-align` 对 flex 子项无效 → 只用于行内流。
- 弹簧 "button +4.2%" 标签与计算值 8.8% 不符 → 自己验算。

## 二、zenuml 现状对照（已核实）

> 本节内容为 2026-10-14 的状态；三处行号（`ParticipantInsertControls.tsx:182`、`StylePanel.tsx:445`、`ParticipantStylePanel.tsx:484`）已于 2026-10-20 按当前代码刷新，其余未重新核对。原证据文件 `evidence/detail-catalogue.md`、`evidence/zenuml-ui-audit.md` 不在仓库内；仓库内版本见 [2026-10-14-claude-frontend-details-catalogue.md](2026-10-14-claude-frontend-details-catalogue.md)。

| 手法 | zenuml 现状 | 证据 |
|---|---|---|
| D1/D2 动效 | 无 token、无 `@keyframes`、无 `animate-*`；仅 Tailwind 默认 150ms 和一处 120ms ease | `ParticipantInsertControls.tsx:182`、`MessageLayer.scss:19` |
| D3 入场 | 所有弹层（参与者编辑器、TypePicker、ColorPicker、StylePanel 菜单、GapHandle 菜单）瞬间出现/消失；遮罩 `bg-slate-900/[0.32]` 硬切 | `ParticipantStylePanel.tsx:484` |
| 坏动效 | Privacy tooltip 由 `display:none` 切 `block`，0.3s 过渡永不执行 | `Privacy/index.module.css:11,31-36` |
| D4/D5 阴影 | 4 组一次性阴影值 + `shadow-sm/md/lg` 混用；z-index 10–60 散落 | `ColorPicker.tsx:60` 等 |
| D6 尺寸 | 圆角 4/5/6/8/10/12 混用；控件高 24/28/30/32 无阶梯 | 审计 §4 |
| D7 按下 | `active:` 0 处；禁用用 `opacity-40` 但仍可点 | `StylePanel.tsx:445` |
| 焦点 | 三种焦点样式：`ring-sky-300`、`ring-slate-400`、`2px #2563eb` outline；多处无焦点样式 | `GapHandleZone.tsx:289`、`EditableSpan.css:21-24` |
| D8 排版 | `tabular-nums` / `text-wrap` / `vertical-align` 0 处；靠 `-translate-y-[1.5px]`、`pt-[3px]` 手调；长参与者名无省略规则 | 审计 §5 |
| D10 反馈 | 无复制/保存反馈（无导出按钮，API only）；图标加载失败只打 console | `DiagramFrame.tsx:42-110` |
| 无障碍 | 已有不少 aria；缺 reduced-motion、焦点陷阱、命中区全部 < 44px（最小 12px） | 审计 §8 |

结论：差距集中在**编辑器外壳（chrome）**——动效、阴影、焦点、按下、尺寸都没有统一系统。图表本体（参与者框、消息）已有主题变量。

## 三、改造计划

原则：
- 先改 chrome，不碰图表渲染 → Playwright 截图不变，风险低。
- 图表本体细节（D8 排版）单独一期，走截图 diff 流程。
- 默认主题不加品牌色（2026-10-04 决定）；全部用中性 slate/black alpha。
- 每期一个 PR，每条修复先写失败测试（bug）或 story（视觉）。

```
P1 chrome tokens ──► P2 弹层入场/出场 ──► P4 按下与禁用
        │                                       
        └──► P3 焦点统一 + reduced-motion        P5 图表排版细节（独立，走截图流程）
P0 修 Privacy tooltip bug（独立，最小）
```

| 期 | 内容 | 涉及文件 | 验收 |
|---|---|---|---|
| P0 | Privacy tooltip 改 `visibility/opacity` 过渡，让动画真正生效 | `Privacy/index.module.css` | 先写失败测试（hover 后计算样式过渡）；浏览器录屏确认淡入 |
| P1 | chrome token：`--zu-dur-{fast,snap,base,sheet,slow}`（60/120/200/300/450）、`--zu-ease-{out,snap,overshoot,standard,spring}`（standard = Tailwind 默认值，zenuml-owned）、`--zu-shadow-{sm,md,pop}`、`--zu-ring`、`--zu-ring-{inner,outer,color}`、`--zu-ring-hairline`（1px，2x 屏 0.5px，3x 屏 1/3px）、`--zu-radius-{sm,md,lg}` = 4/6/8 + 面板 10 + 对话框 16（嵌套规则：外 = 内 + 4px）、`--zu-h-control` 24 / `--zu-h-control-nested` 18，只在 `.zenuml` 上声明一次（不用 `:root`）；阴影、alpha 边框、焦点值标注 zenuml-owned；替换 4 组一次性阴影值、3 种焦点、混用圆角 | `src/assets/tailwind.css` + tailwind config + ~8 个编辑器组件 | 单测过；Playwright 截图零变化；`check-zu-tokens.mjs` 通过；grep `shadow-[`/`duration-[`/`rounded-[`/`ring-[` 为 0；gzip 增量 ≤ 4,500 B（评估 §f） |
| P2 | 弹层动效：编辑器/Picker/菜单 入场 `opacity+scale(.96)+translateY(4px)` 200ms `out`（.96/4px 为 zenuml 自定（zenuml-owned））；出场 120ms = `--zu-dur-snap`（借用 token：Claude 的 `cds-pill-out`、`epitaxy-band-exit` 出场即用 `--cds-dur-snap`，WEB 53701/57942、ASAR 5079）；遮罩淡入；只动 transform/opacity；可选：Picker 依次入场（chip-in）、TypePicker 列表滚动渐隐遮罩（28px） | `ParticipantStylePanel`、`TypePicker`、`ColorPicker`、`StylePanel`、`GapHandleZone` | workbench 中逐个录屏；关闭后焦点仍回原槽位（现有测试保持通过）；测试断言每个弹层根节点打开时有非零动画或过渡 |
| P3 | 统一 `focus-visible` 环（结构：间隙 + 1px 环 + 柔光，中性色；1px 环与柔光数值、容器聚焦光晕 `0 4px 20px` .035→.075 均为 zenuml 自定（zenuml-owned））；补无焦点样式的按钮；`prefers-reduced-motion: reduce` 或宿主设置的 `[data-reduce-motion="true"]` 都把 `--zu-dur-*` 置 0 | 同上 + 折叠按钮 | Playwright：每个可交互控件 `:focus-visible` 时 outline 或 box-shadow 变化且不是浏览器默认；reduced-motion 下 transition/animation 时长全为 0s |
| P4 | 按下 `scale(.975)`：按下 60ms ease-out，松开 450ms `linear()` 弹簧（`--zu-ease-spring`），reduced-motion 下关闭；禁用改 `disabled`/`aria-disabled` 并真正不可点；小控件命中区扩到 ≥ 24px（用伪元素扩区，不改视觉尺寸）；可选：选中色块/类型时 pill pop | StylePanel、InsertControls、collapse、swatch | 组件测试：禁用项点击无效果；命中区断言（中心 ±11px 五点都命中控件，WCAG 2.2 SC 2.5.8；24px 框的 ±12 落在边缘之外，见评估 §f 门槛 5） |
| P5 | 图表排版：长参与者名省略/`overflow-wrap:anywhere`；图标与 stereotype 光学对齐代替 `translate-y-[1.5px]`；序号只用 `font-variant-numeric: tabular-nums`（不加 `font-feature-settings`） | 参与者、消息、fragment 组件 + SVG 渲染器同步 | `analyze-compare-case.mjs` 逐 case 归因，只接受预期像素变化 |

不做：品牌色 clay、聊天专属组件（打字模糊、思考点）、弹簧物理库（CSS 曲线足够，拖拽手感另议）。

### 2026-10-19 修订（依据 open-claude-ui v2 评估）

依据：[2026-10-19-open-claude-ui-v2-assessment.md](2026-10-19-open-claude-ui-v2-assessment.md)（用 claude.ai 网页 CSS 与 Claude.app 2.42304.2 的真实 CSS 逐行核对 118 条说法）；决策记录 [ADR 0003](../adr/0003-borrow-claude-design-values.md)。

- **P1**：D1 时长、D2 曲线在真实 CSS 中存在，数值不变；新增 `--zu-dur-slow` 450ms 与 `--zu-ease-spring`（供 P4 松开回弹）、`--zu-ease-standard`（.4,0,.2,1，Tailwind 默认值，zenuml-owned）。新增视网膜细线 `--zu-ring-hairline` 和 `--zu-ring-{inner,outer,color}`。默认控件高 24px（不是 28px），嵌套控件 18px；圆角 4/6/8 + 面板 10 + 对话框 16，外圆角 = 内圆角 + 4px。阴影、alpha 边框、焦点环的真实值与 D4/D5 不一致，改为 zenuml 自定并标注 zenuml-owned。token 只在 `.zenuml` 上声明一次。不用 rem-scale，不用 color-mix 阴影，不用 (.16,1,.3,1)。详见评估 §e P1。
- **P2**：出场保持 **120ms** = `--zu-dur-snap`（借用 token：Claude 的 `cds-pill-out`、`epitaxy-band-exit` 出场用 `--cds-dur-snap`，WEB 53701/57942、ASAR 5079；时间线状态淡出用 150–180ms 字面值，SHARED 209/276/279，不采用。2026-10-20 更正：早先草稿误称没有 120ms 的出场）；入场 200ms 不变，入场 .96/4px 也是 zenuml 自定（zenuml-owned）。只动 transform/opacity；`ParticipantInsertControls.tsx:182` 的 `transition-all` 改为明确属性。新增断言：弹层打开时有非零动画。可选：chip-in 依次入场、28px 滚动渐隐遮罩。详见评估 §e P2。
- **P3**：焦点环用「间隙 + 1px 环 + 柔光」结构（不是 1.5px），中性色；1px 环、柔光和容器聚焦光晕 .035→.075 的数值均为 zenuml 自定（zenuml-owned）。reduced-motion 除媒体查询外，也认宿主设置的 `[data-reduce-motion="true"]`。详见评估 §e P3。
- **P4**：按下由 `active:scale-[.97]`（120ms snap）改为 `scale(.975)`，按下 60ms ease-out、松开 450ms `linear()` 弹簧（Claude 的 `.cds-btn-squish`）。命中区仍用 zenuml 自己的扩区方式。可选：选中 pill pop（峰值 1.32）。详见评估 §e P4。
- **P5**：序号只用 `font-variant-numeric: tabular-nums`，不加 `font-feature-settings: "tnum" 1`。详见评估 §e P5。
- 各期验收门槛（token 校验脚本、grep、reduced-motion、focus-visible、24px 命中区、图表截图不变、gzip 预算 +4,500 B）见评估 §f。

## 四、待你决定

- token 前缀 `--zu-`、作用域 `.zenuml` 是否可以？
- P0–P4 是否授权在分支上开 PR？
