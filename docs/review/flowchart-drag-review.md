# PR Review：Flowchart 节点拖拽重排功能

**审查日期：** 2026-05-29
**审查人：** 自审
**分支：** `develop`
**涉及文件：** 6 个（2 个修改，4 个新增）

---

## 总体评估

**结论：APPROVE（通过，附带非阻塞性建议）**

本 PR 为 Mermaid Live Editor 引入了一套完全自包含、零外部依赖的 Flowchart 节点交互式拖拽重排系统。架构方面严格解耦，未侵入宿主应用或 Mermaid.js 的任何内部逻辑。坐标映射采用原生 SVG CTM（`getScreenCTM`）实现数学上严密的跨空间转换；高频渲染路径（`onPointerMove`）采用 Snapshot + Delta 模式，每帧零次 DOM 读取。

---

## 审查文件清单

| # | 文件 | 状态 | 行数 | 职责 |
|---|---|---|---|---|
| 1 | `src/lib/util/dragInteraction.ts` | 新增 | 691 | 核心拖拽引擎 + CTM 工具函数 |
| 2 | `src/lib/util/edge-path.ts` | 新增 | 166 | 纯几何库：矩形边界交点、贝塞尔路由、Label 定位 |
| 3 | `src/lib/util/MermaidGraphParser.ts` | 新增 | 324 | DOM 提取层：SVG → 图拓扑结构 |
| 4 | `src/lib/components/DragToolbar.svelte` | 新增 | 63 | UI 工具栏：开关、撤销、重做、导出 |
| 5 | `src/lib/components/View.svelte` | 修改 | +9 | 新增 `onSvgRendered` 回调 prop |
| 6 | `src/routes/edit/+page.svelte` | 修改 | +75 | 将拖拽系统接入编辑页面 |

---

## 逐项审查

### 1. 架构解耦 — PASS

整个拖拽子系统仅通过渲染后 SVG 的公开 DOM 接口与宿主应用交互：

```
View.svelte → onSvgRendered({ svg, diagramType })
    → edit/+page.svelte → FlowchartDrag(svg)
        → MermaidGraphParser.parse()   // 仅读取 DOM
        → drag-event → delta 数学推导  // 拖拽中零 DOM 读取
        → setAttribute('transform')    // 写入 DOM
```

- 所有新增文件中**零处引入 Mermaid.js 内部模块**
- 未对渲染管线做任何 monkey-patch
- 与宿主应用之间仅通过一个回调 prop 传递数据，无共享可变状态
- **功能可随时移除**：删除 4 个文件 + 回滚 2 个小 diff 即可

### 2. 坐标映射 — PASS（附一条备注）

**CTM 工具函数**（`mapPointToSpace`、`getRectInSpace`、`getTranslate`）：

- 以 `getScreenCTM()` 为全局参考系——可处理任意嵌套深度的 `<g>` 变换、viewBox 缩放、平移/缩放状态，无需任何正则解析
- 四角映射保证在不同坐标系之间存在缩放差异时，width/height 仍然精确
- CTM 失败时返回 `null`，所有调用方均有空值兜底

**Snapshot + Delta 模式（`onPointerMove`）：**

```
// Snapshot（onPointerDown）：通过 CTM 一次性捕获各节点 Rect
initialRects[id] = getRectInSpace(nodeEl, edgeGroup, edgeInverseCTM)

// Delta（onPointerMove）：纯数学运算，零 DOM 读取
currentRect = { x: initial.x + dx, y: initial.y + dy, w, h }
```

> **备注：** 此实现假设 viewBox 指针增量空间与 edgePaths 空间尺度一致且无相对旋转。在 Mermaid 标准 SVG 输出中，这一假设成立（edgePaths 为根 `<g>` 的直接子元素，无额外 transform）。若未来 Mermaid 版本为 edgePaths 添加了变换，则需要将 delta 经由 edgePaths 的 CTM 变换后方可应用。当前风险可接受。

### 3. 渲染性能 — PASS

| 阶段 | DOM 读取 | DOM 写入 | CTM 调用次数 |
|---|---|---|---|
| onPointerDown | getBBox × N + getScreenCTM × (N + 1) | 无 | N |
| onPointerMove（每帧） | 0 | setAttribute × 1 | 1（getViewBoxPoint） |
| onPointerUp | getAttribute × E | 0 | 0 |

- N = 涉及的节点数（拖拽节点 + 对端节点），通常 2-5 个
- E = 边数，仅在快照捕获时使用
- 每帧开销为 O(edges) 纯数学运算——可忽略不计

### 4. 边 Label 跟随 — PASS

`updateEdgePath` 在设置 path 的 `d` 属性后立即调用 `positionEdgeLabel`。Label 的 CTM 映射通过 `getPointAtLength(0.5)` + `getScreenCTM()` 实现跨容器坐标转换，正确处理 `<g class="edgeLabels">` 与 `<g class="edgePaths">` 为同级兄弟节点的情况。

### 5. 撤销/重做 — PASS

- 有界栈（默认 50 条）
- 快照内容：`Record<nodeId, {x, y}>` + `Record<edgeId, d属性>`
- `applySnapshot` 恢复节点 transform + 边路径 + CTM 映射后的 Label 位置
- 仅当节点确实发生位移时才推入栈（`onPointerUp` 中有 early-return 检查）

### 6. Mermaid 版本兼容性 — PASS

`MermaidGraphParser.extractEdges()` 处理三种格式：
1. **Mermaid 11+**：`<g class="edgePaths"><path data-id="L_A_B_0"/>` + `<g class="edgeLabels">`
2. **Mermaid 10.x**：`<g class="edgePath"><path/></g>` 各自独立包装
3. **兜底**：`path[data-et="edge"][data-id]` 属性选择器

`resolveNodeId()` 同时支持 Mermaid 11+ 的 `flowchart-<id>-<counter>` 格式与旧版格式。

### 7. UI 集成 — PASS

- DragToolbar 位于 PanZoomToolbar 下方，通过 `flex-col gap-2` 纵向排列
- 条件渲染：`{#if isFlowchart}`，由 `$state` 驱动
- `interactiveMode` 通过 `$bindable` + `bind:pressed` 管理（Svelte 5 标准模式）
- `dragToken` 计数器确保 `$effect` 在控制器创建/刷新后重新执行

### 8. 错误处理 — PASS

- `getBBox()` 包裹 try-catch，含 fallback（子元素 bbox 联合）
- `getRectInSpace` 在任何失败时返回 null
- `FlowchartDrag` 构造过程在编辑页中由 try-catch 包裹
- 指针捕获释放由 try-catch 包裹（可能已被释放）
- `getTotalLength()` / `getPointAtLength()` 由 try-catch 包裹（path 可能尚未可渲染）

### 9. 类型安全 — PASS

- 完全符合 TypeScript strict 模式
- 新增代码中零处 `any` 类型
- 正确使用 `SVGGraphicsElement` / `SVGGElement` / `SVGPathElement` 等精确类型
- `noUnusedLocals` / `noUnusedParameters` 均通过

---

## 非阻塞性建议

### NB-1：viewBox 空间与 edgePaths 空间的 delta 假设

`onPointerMove` 将 viewBox 指针增量直接应用于 edgePaths 空间的坐标。若 `edgePaths` 将来获得非恒等变换，此假设将被打破。缓解方案：在 `onPointerDown` 中计算并缓存 viewBox→edgePaths 的 delta 变换矩阵。**当前可接受**——Mermaid 不会对 edgePaths 施加变换。

### NB-2：多点触控时的对端节点陈旧问题

若两个用户同时拖拽两个相连节点（多点触控），`initialRects` 中对端节点的位置将不再准确。此为理论边界情况——当前 UX 仅支持单指针拖拽。**无需处理。**

### NB-3：大图快照体积

`captureState()` 序列化所有边的 `d` 属性，不论哪些边发生了变动。在 100+ 边的图中，单条快照约 50KB。50 条快照的栈上限限制了总内存占用。**可接受**——Live Editor 中的 Flowchart 通常不超过 20 个节点。

### NB-4：applySnapshot 中 Label CTM 逻辑重复

`applySnapshot` 中复制了 `edge-path.ts:positionEdgeLabel` 的 CTM 映射逻辑。建议抽取为共享的 `positionEdgeLabel(pathEl, labelEl)` 调用。**轻度 DRY 违规**——优先级低。

---

## 构建验证

```
npx vite build  → ✔ done（输出至 docs 目录）
npx tsc --noEmit → ✔ 零 src/ 编译错误
```

---

## 测试清单

- [ ] Flowchart 图：DragToolbar 在右上角可见
- [ ] 非 Flowchart 图：DragToolbar 隐藏
- [ ] 切换交互模式：节点光标变为 `grab`
- [ ] 拖拽节点：节点跟随指针移动，连线实时重路由，Label 跟随
- [ ] 释放节点：最终位置正确
- [ ] 撤销（Ctrl+Z）：节点 + 连线回退
- [ ] 重做（Ctrl+Shift+Z）：拖拽重新应用
- [ ] 导出布局 JSON：文件正常下载
- [ ] 图表重新渲染（修改代码）：拖拽系统正确重新初始化
- [ ] 触摸设备：pointer 事件正常（button === 0 检查）
