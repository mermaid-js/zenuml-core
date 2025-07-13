# ZenUML Pure Mathematical Layout Architecture

## 设计原则

### 1. 分离关注点 (Separation of Concerns)
- **解析层**: Context → 结构化数据
- **数据层**: 类型安全的几何对象
- **计算层**: 纯数学函数
- **渲染层**: Layout 结果 → 组件

### 2. 单向数据流
```
Parse Tree → Geometry → Calculations → Layout → Rendering
    ↓           ↓           ↓           ↓         ↓
 Context    DTOs        Pure Math   Results   Components
```

### 3. 纯函数式计算
- 所有布局计算都是纯函数
- 相同输入始终产生相同输出
- 无副作用，易于测试和缓存

### 4. 类型安全
- 强类型几何数据对象
- 编译时错误检查
- 自文档化的接口

## 架构层次

### Layer 1: Geometry Models (几何数据模型)
```typescript
interface LayoutGeometry {
  participants: ParticipantGeometry[];
  messages: MessageGeometry[];
  fragments: FragmentGeometry[];
  metadata: DiagramMetadata;
}
```

### Layer 2: Pure Calculators (纯数学计算器)
```typescript
class LayoutEngine {
  calculateParticipantPositions(geometry: LayoutGeometry): PositionMap;
  calculateFragmentBounds(fragment: FragmentGeometry): FragmentBounds;
  calculateArrowLayout(arrow: ArrowGeometry): ArrowLayout;
}
```

### Layer 3: Context Extractors (数据提取器)
```typescript
class LayoutGeometryExtractor {
  extractFromContext(context: any): LayoutGeometry;
}
```

### Layer 4: Layout Hooks (React 集成)
```typescript
const useLayout = (context: any) => {
  const geometry = useMemo(() => extractor.extract(context), [context]);
  const layout = useMemo(() => engine.calculate(geometry), [geometry]);
  return layout;
};
```

## 优势

1. **性能**: 减少重复的 Context 遍历
2. **缓存**: 纯函数结果可以安全缓存
3. **测试**: 每层都可以独立测试
4. **维护**: 清晰的职责边界
5. **扩展**: 易于添加新的布局特性