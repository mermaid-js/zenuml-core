# 位置计算重构方案

## 背景

在早期版本里，组件需要 `sequence` 字段来确定消息的纵向位置。移除该字段之后，现有的高度计算链路暴露出两个问题：

1. **重复计算**：组件层和辅助方法会对同一个 block 做多次遍历；
2. **状态驱动**：每个消息组件都需要把自身的位置信息写回 `participantMessagesAtom`，导致渲染和计算逻辑强耦合。

目前的实现仍能工作，但随着 DSL 越来越复杂，重复遍历会拖慢渲染速度，也让定位 bug 变得困难。因此需要一套集中、可测试的计算方案。

## 现状问题

### 1. 组件与 `accumulateBlock` 双重遍历

在重构前，`Block.tsx` 通过 `accumulateBlock` 预计算 `statementTops`：

```typescript
const statementTops = useMemo(
  () => accumulateBlock(props.context, props.origin || "", props.top ?? 0).tops,
  [props.context, props.origin, props.top],
);
```

但是多个 Fragment 组件仍保留了 `runningTop` + `advanceNestedBlock` 的手动遍历逻辑；`Creation`、`Interaction` 等组件为了写 store 又重复计算消息顶点。这些计算路径彼此独立，任何常量的微调都要同步多个地方。最新代码已经用 `computeBlockLayout` 替换 `accumulateBlock`，但 Fragment 层的重复遍历仍然存在，是后续需要处理的重点。

### 2. Store 写入与渲染耦合

消息组件内的 `useEffect` 会在挂载和卸载时更新 `participantMessagesAtom`。这保证了数据正确，但带来两个副作用：

- 渲染依赖 `top` prop，`top` 再依赖上层手动传递；
- 卸载时需要清理 store，生命周期复杂且难以覆盖测试。

### 3. `top` 传递链拉长

`MessageLayer → Block → Statement → (Fragment|Message)` 逐层透传 `top`，并在 `Occurrence` 中继续向子 `Block` 传递。这个链路不仅脆弱，也让局部重算非常困难。

## 重构目标

1. **一次遍历拿到全部需要的数据**：同一份遍历结果同时提供 `statementTop`、`blockEnd` 和 `messageRecords`；
2. **集中写入 store**：由 `MessageLayer` （或其上层）负责同步 `participantMessagesAtom`，组件只消费数据，不再负责写入；
3. **逐步削减 `top` 透传**：当集中计算结果可以提供嵌套 block 的起始高度后，再删除多余的 props；
4. **保持现有渲染行为**：LifeLine、Occurrence、Numbering 等功能在重构过程中不能退化。

## 设计方案

### 方案概览

重构围绕一个新的纯函数 `computeBlockLayout` 展开。它基于现有的 `accumulateBlock/advanceStatement`，返回统一的布局数据结构：

```ts
interface BlockLayoutResult {
  tops: number[];           // 与现有 statementTops 对齐
  endTop: number;           // block 结束位置
  messages: MessageRecord[];// 同时收集消息位置信息
  statements: StatementLayout[]; // 每条语句的布局细节
}

interface MessageRecord {
  participant: string;
  id?: string;
  type: "creation" | "sync" | "async" | "return";
  top: number;
}

type StatementLayout =
  | {
      kind: "creation";
      top: number;
      messageTop: number;
      targetParticipant?: string;
      childStartTop: number;
      childLayout?: BlockLayoutResult;
    }
  | {
      kind: "sync";
      top: number;
      messageTop: number;
      targetParticipant?: string;
      isSelf: boolean;
      childStartTop?: number;
      childLayout?: BlockLayoutResult;
    }
  | {
      kind: "async";
      top: number;
      messageTop: number;
      targetParticipant?: string;
      isSelf: boolean;
    }
  | {
      kind: "return";
      top: number;
      messageTop: number;
      targetParticipant?: string;
    }
  | {
      kind: "divider";
      top: number;
    }
  | {
      kind: "fragment";
      top: number;
      fragmentType: string;
      branches: Array<{ startTop: number; layout?: BlockLayoutResult }>;
    }
  | {
    kind: "unknown";
    top: number;
  };
```

关键点：

- **单一递归**：对每个 statement，只在 `computeBlockLayout` 内部遍历一次。遇到嵌套 block 时再递归调用自身，返回的 `endTop/messages` 直接复用，不需要额外的 `calculateBlockEndTop`。
- **复用现有常量**：逻辑沿用 `advanceStatement`，确保高度计算和渲染常量保持一致。
- **记录 Occurrence 的起讫高度**：`StatementLayout` 为消息类语句提供了 `messageTop` 以及 `childStartTop/childLayout`，`Occurrence` 可以直接读取这些信息，而不需要依赖逐层透传的 `top`。

### 计算流程

1. **Block 调用**：`Block` 组件在 `useMemo` 中调用 `computeBlockLayout`，得到 `tops` 和 `messages`。短期内继续把 `tops` 传给子 `Statement`，保证兼容。
2. **MessageLayer 汇总**：根 block 计算完成后，`MessageLayer` 得到所有 `messages`。利用辅助函数 `groupMessagesByParticipant`（沿用 store 中的实现）生成最终的 `ParticipantMessagesMap`。
3. **集中写入 store**：使用 `useLayoutEffect` 或 `useEffect` 比较新旧 map，当值有变化时一次性调用 `setParticipantMessages`。当 `MessageLayer` 卸载时，把 map 重置为空，保持现有行为。
4. **组件消费**：
   - `Creation/Interaction/Return/InteractionAsync` 只负责渲染，不再 `useEffect` 写 store；
   - `Occurrence` 接受一个新的 `occurrenceLayout`（或继承 message record 中的字段）来驱动子 block；
   - Fragment 组件的 `runningTop` 删除，改为读取布局数据（若短期调整难度大，可在 Phase 2 再处理）。

### 实现细节

- **布局缓存**：`computeBlockLayout` 是纯函数，可以通过 `useMemo` 缓存。依赖项为 `(context, origin, startTop)`。
- **消息 ID 策略**：保持当前 `props.number || `${target}-${messageTop}`` 的逻辑，作为计算阶段的辅助函数，确保 LifeLine 等读取方式不变。
- **兼容可折叠行为**：`Occurrence` 内部对 `collapsed` 状态的处理不受影响，只需把新的起始高度映射到子 Block 的 `top`。

## 分阶段实施计划

### Phase 0：铺垫

- 为 `accumulateBlock` 增加单元测试，锁定现有高度计算行为；
- 梳理 `participantMessagesAtom` 的写入点和测试覆盖情况。

### Phase 1：布局函数落地

1. 新建 `src/positioning/computeBlockLayout.ts`，把现有 `accumulateBlock` 的逻辑迁移/封装为可返回 `messages` 的函数；
2. 更新 `Block.tsx`，改用新函数返回 `{tops, messages}`；
3. 调整调用方确保 `tops` 行为与当前一致；
4. 添加针对 `computeBlockLayout` 的测试（输入 DSL parser stub，检查 `messages/top` 是否正确）。

### Phase 2：集中写 store

1. 在 `MessageLayer` 中引入 `useEffect`，根据 Phase 1 的结果对 `participantMessagesAtom` 做一次性写入/重置；
2. 删除 `Creation/Interaction/InteractionAsync/Return` 中的 store 写入 `useEffect`，保留渲染逻辑；
3. 更新相关测试，确保消息卸载时 `participantMessagesAtom` 会被清空或更新。

### Phase 3：移除冗余高度传递

1. 移除 `Statement`、`Occurrence`、`FragmentAlt` 等组件中的 `top` props；
2. 为 `Occurrence` 设计新的输入结构（例如从消息布局中读取 `childBlockStartTop`），确保 `src/components/.../Occurrence.tsx` 不再直接依赖 `props.top`；
3. 删除 Fragment 组件（`FragmentAlt`, `FragmentTryCatchFinally` 等）中的 `runningTop` + `advanceNestedBlock` 逻辑，改为消费集中计算的布局信息；
4. 在完全移除 `advanceNestedBlock` 前，确认编号逻辑仍有可靠的数据来源（必要时保留一个 `computeNumbering` 专用函数）。

### Phase 4：清理与优化

- 清理未使用的常量/工具函数；
- 查看大型图表的渲染性能，确认遍历次数减少；
- 评估是否需要在 `computeBlockLayout` 内做 memo/cache 以支持局部更新。

## 风险与缓解

- **高度常量漂移**：所有高度常量依旧集中在 `@/positioning/Constants`，测试要覆盖常见 statement/fragment；
- **生命周期覆盖**：集中写 store 后要确保 MessageLayer 卸载能触发 reset（可以封装 `useParticipantMessagesSync` hook 增强可测试性）；
- **Fragment 复杂度**：Phase 3 删除 `runningTop` 时，需要保证多分支 fragment（`alt/tcf` 等）的 `statementTop` 仍旧正确，可借助快照测试或端到端测试验证。

## 下一步

- （进行中）在实际项目中验证 `computeBlockLayout` + 集中写 store 的稳定性；
- 梳理 `Occurrence`/Fragment 组件对 `top` 的依赖，拆分出可复用的布局描述；
- 在真实 DSL 样例上验证新布局函数输出，并补充覆盖 `async`、`return`、多分支 fragment 等边界。

---

## 最新澄清：关于 `top` 与布局的范围

结合近期讨论，需要补充以下共识，避免误解：

- **集中遍历的唯一服务对象是 Lifeline**：我们运行一次 `computeBlockLayout` 的目的，只是为了拿到每个参与者第一条消息的绝对高度，写入 `participantMessagesAtom`，供 Lifeline 使用。其它渲染组件（消息本体、Occurrence、Fragment 边框等）依旧通过各自的 CSS/既有逻辑来定位。
- **其余组件不需要透传 layout/`top`**：过去尝试把集中计算得到的 `layout` props 往下传，是多余的。消息、Fragment 等组件依赖的是自身的布局样式，无需消费此次遍历的结果。
- **高度常量的历史定位**：这些常量最初就是为了 Lifeline 推算 `top` 而存在。其它组件引用它们只是历史上复用同一套数值，不代表必须与集中遍历绑定。未来若要彻底去除常量，需要配合 DOM/CSS 的改造，而不是在本轮重构中强行剥离。
- **后续任务**：
  1. 保持“顶层一次遍历 + 写入 store”这一流程，但避免再度往下传 layout 数据。
  2. 借着本次梳理，记录哪些组件仍直接使用高度常量，为后续“去常量化”准备空间；届时应首先改造 DOM/CSS，使它们真正依赖浏览器布局，再逐步撤除常量。

这样既保留了之前的分析框架，也明确了当前阶段的边界：**顶层遍历只为 Lifeline，其他组件仍遵循现有 CSS 布局**。
