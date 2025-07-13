# ZenUML 布局系统统一数学模型

## 核心发现与数学本质

通过深入分析ZenUML的代码结构，我发现了其布局系统的数学本质：**多层级坐标系统的几何变换**。

### 1. 坐标系统层次结构

ZenUML的布局基于三个层次的坐标系统：

#### 1.1 全局坐标系 (Global Coordinate System)
- **原点**: 左边界
- **单位**: 像素 (px)
- **范围**: [0, totalWidth]

#### 1.2 参与者坐标系 (Participant Coordinate System)  
- **原点**: 各参与者的中心位置
- **单位**: 像素 (px)
- **定位算法**: David Eisenstat 最优间距算法

#### 1.3 激活层坐标系 (Activation Layer Coordinate System)
- **原点**: 参与者中心
- **单位**: OCCURRENCE_BAR_SIDE_WIDTH (7.5px)
- **层数**: 嵌套消息深度

## 2. 统一数学模型

### 2.1 核心数学对象

```typescript
// 参与者几何数据
interface ParticipantGeometry {
  name: string;
  centerPosition: number;     // 在全局坐标系中的中心位置
  halfWidth: number;          // 参与者宽度的一半
  activationLayers: number;   // 当前激活层数
}

// 锚点：参与者在特定激活层的精确位置
interface Anchor {
  position: number;           // 全局坐标系位置
  layers: number;             // 激活层数
}
```

### 2.2 基础几何变换

```typescript
// 1. 参与者定位变换
function participantPosition(participant: ParticipantGeometry): number {
  return participant.centerPosition;
}

// 2. 激活层变换  
function activationLayerOffset(layers: number): number {
  return OCCURRENCE_BAR_SIDE_WIDTH * layers;
}

// 3. 锚点坐标变换
function anchorCoordinate(participant: ParticipantGeometry): Anchor {
  return {
    position: participant.centerPosition + activationLayerOffset(participant.activationLayers),
    layers: participant.activationLayers
  };
}
```

### 2.3 距离与宽度计算

```typescript
// 参与者间距离
function participantDistance(from: ParticipantGeometry, to: ParticipantGeometry): number {
  return to.centerPosition - from.centerPosition;
}

// 锚点间距离（考虑激活层）
function anchorDistance(from: Anchor, to: Anchor): number {
  const fromEdge = from.position + OCCURRENCE_BAR_SIDE_WIDTH * from.layers;
  const toEdge = to.position - OCCURRENCE_BAR_SIDE_WIDTH * Math.max(0, to.layers - 1);
  return toEdge - fromEdge - LIFELINE_WIDTH;
}

// 消息宽度
function messageWidth(message: Message, coordinates: Coordinates): number {
  const baseWidth = textWidth(message.signature);
  const layerCorrection = message.type === 'creation' ? 
    coordinates.half(message.to) : 0;
  return baseWidth + layerCorrection;
}
```

## 3. Fragment偏移的数学原理

Fragment的偏移计算是最复杂的部分，其数学本质是**多重坐标系变换的复合**：

### 3.1 偏移计算公式

```
offsetX = borderPadding.left + participantAlignmentCorrection + activationLayerCorrection
```

其中：
- `borderPadding.left = FRAGMENT_PADDING_X * nestedDepth`
- `participantAlignmentCorrection = leftParticipant.halfWidth`
- `activationLayerCorrection = anchor2Origin.centerToCenter(anchor2LeftParticipant)`

### 3.2 数学推导

对于Fragment在参与者A上，但起源于参与者B（具有N层激活）：

```typescript
function fragmentOffset(
  leftParticipant: ParticipantGeometry,
  originParticipant: ParticipantGeometry,
  borderDepth: number
): number {
  // 1. 边界填充
  const borderPadding = FRAGMENT_PADDING_X * borderDepth;
  
  // 2. 参与者对齐
  const participantAlignment = leftParticipant.halfWidth;
  
  // 3. 激活层校正
  const leftAnchor = new Anchor(leftParticipant.centerPosition, 0);
  const originAnchor = new Anchor(originParticipant.centerPosition, originParticipant.activationLayers);
  const layerCorrection = leftAnchor.centerToCenter(originAnchor);
  
  return borderPadding + participantAlignment + layerCorrection;
}
```

## 4. 宽度计算的统一模型

### 4.1 总宽度计算

```typescript
function totalWidth(
  context: Context,
  coordinates: Coordinates
): number {
  const geometry = extractGeometry(context);
  const participantSpan = calculateParticipantSpan(geometry);
  const borderSpan = calculateBorderSpan(geometry);
  const selfMessageExtra = calculateSelfMessageExtra(geometry);
  
  return Math.max(
    participantSpan + borderSpan.left + borderSpan.right + selfMessageExtra,
    FRAGMENT_MIN_WIDTH
  );
}

function calculateParticipantSpan(geometry: ContextGeometry): number {
  const leftParticipant = geometry.leftmostParticipant;
  const rightParticipant = geometry.rightmostParticipant;
  
  return coordinates.distance(leftParticipant.name, rightParticipant.name) +
         leftParticipant.halfWidth + rightParticipant.halfWidth;
}
```

## 5. 优化后的统一接口设计

### 5.1 核心计算引擎

```typescript
class UnifiedLayoutEngine {
  private coordinates: Coordinates;
  
  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
  }
  
  // 统一的几何数据提取
  extractGeometry(context: any): ContextGeometry {
    return {
      participants: this.extractParticipants(context),
      messages: this.extractMessages(context),
      fragments: this.extractFragments(context),
      borderDepth: this.calculateBorderDepth(context)
    };
  }
  
  // 统一的位置计算
  calculatePosition(entity: GeometricEntity): Position {
    switch(entity.type) {
      case 'participant': return this.calculateParticipantPosition(entity);
      case 'message': return this.calculateMessagePosition(entity);
      case 'fragment': return this.calculateFragmentPosition(entity);
    }
  }
  
  // 统一的尺寸计算
  calculateDimensions(entity: GeometricEntity): Dimensions {
    const width = this.calculateWidth(entity);
    const height = this.calculateHeight(entity);
    return { width, height };
  }
  
  // 统一的变换应用
  applyTransforms(position: Position, transforms: Transform[]): Position {
    return transforms.reduce((pos, transform) => 
      this.applyTransform(pos, transform), position
    );
  }
}
```

### 5.2 数学常量统一管理

```typescript
const LAYOUT_CONSTANTS = {
  // 基础间距
  MARGIN: 20,
  FRAGMENT_PADDING_X: 10,
  ARROW_HEAD_WIDTH: 10,
  OCCURRENCE_WIDTH: 15,
  OCCURRENCE_BAR_SIDE_WIDTH: 7.5,
  LIFELINE_WIDTH: 1,
  
  // 最小尺寸
  MIN_PARTICIPANT_WIDTH: 80,
  FRAGMENT_MIN_WIDTH: 100,
  
  // 计算精度
  EPSILON: 1e-10,
} as const;
```

## 6. 关键数学洞察

### 6.1 坐标变换的可组合性
所有的位置计算都可以分解为基础变换的组合：
- 平移 (translation)
- 缩放 (scaling) 
- 层级偏移 (layer offset)

### 6.2 缓存策略的数学基础
由于大部分计算都是纯函数，可以基于输入参数的散列值进行缓存：

```typescript
function memoizedCalculation<T, R>(
  fn: (input: T) => R,
  keyExtractor: (input: T) => string
): (input: T) => R {
  const cache = new Map<string, R>();
  
  return (input: T): R => {
    const key = keyExtractor(input);
    if (!cache.has(key)) {
      cache.set(key, fn(input));
    }
    return cache.get(key)!;
  };
}
```

### 6.3 布局算法的数学性质
David Eisenstat算法的本质是**约束优化问题**：
- 目标函数：最小化总宽度
- 约束条件：消息宽度要求、最小间距要求
- 解法：动态规划 + 对偶数理论

## 7. 实现建议

### 7.1 分离关注点
1. **几何提取层**：从context提取纯几何数据
2. **数学计算层**：基于几何数据进行纯数学运算  
3. **样式应用层**：将计算结果转换为CSS样式

### 7.2 性能优化
1. **预计算**：在坐标系变化时预计算常用值
2. **增量更新**：只重新计算变化的部分
3. **并行计算**：独立计算可以并行执行

### 7.3 可测试性
纯数学函数便于单元测试，可以构建完整的测试矩阵覆盖所有几何情况。

---

这个统一的数学模型将复杂的布局逻辑简化为清晰的几何变换，使代码更易于理解、测试和优化。