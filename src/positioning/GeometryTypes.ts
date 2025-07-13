/**
 * 统一的几何数据类型定义
 * 这些类型包含布局计算所需的纯几何信息，不依赖于复杂的context对象
 */

/**
 * 参与者几何数据
 * 包含参与者在布局中的所有几何属性
 */
export interface ParticipantGeometry {
  readonly name: string;
  readonly centerPosition: number;    // 在全局坐标系中的中心位置
  readonly halfWidth: number;         // 参与者宽度的一半
  readonly activationLayers: number;  // 当前激活层数（嵌套深度）
}

/**
 * 锚点几何数据
 * 表示参与者在特定激活层的精确位置信息
 */
export interface AnchorGeometry {
  readonly position: number;     // 全局坐标系位置
  readonly layers: number;       // 激活层数
}

/**
 * 消息几何数据
 * 包含消息布局所需的几何信息
 */
export interface MessageGeometry {
  readonly from: ParticipantGeometry;
  readonly to: ParticipantGeometry;
  readonly textWidth: number;         // 消息文本宽度
  readonly messageType: string;       // 消息类型（用于特殊处理）
}

/**
 * Fragment几何数据
 * 包含Fragment布局所需的几何信息
 */
export interface FragmentGeometry {
  readonly leftParticipant: ParticipantGeometry;
  readonly rightParticipant: ParticipantGeometry;
  readonly localParticipants: readonly ParticipantGeometry[];
  readonly borderDepth: number;       // 嵌套深度（影响边界填充）
  readonly origin: ParticipantGeometry;
}

/**
 * 位置信息
 */
export interface Position {
  readonly x: number;
  readonly y: number;
}

/**
 * 尺寸信息
 */
export interface Dimensions {
  readonly width: number;
  readonly height: number;
}

/**
 * 布局计算结果
 */
export interface LayoutResult {
  readonly position: Position;
  readonly dimensions: Dimensions;
  readonly transform?: string;        // CSS transform 字符串
}

/**
 * Fragment布局计算结果
 */
export interface FragmentLayoutResult extends LayoutResult {
  readonly offsetX: number;           // X轴偏移量
  readonly paddingLeft: number;       // 左边距
  readonly borderPadding: {           // 边界填充
    left: number;
    right: number;
  };
}