/**
 * Fragment布局计算器
 * 基于统一数学模型简化Fragment偏移和布局计算
 * 替代原有的复杂Fragment几何提取逻辑
 */

import { FragmentGeometry, FragmentLayoutResult, ParticipantGeometry } from "./GeometryTypes";
import { ParticipantGeometryExtractor } from "./ParticipantGeometryExtractor";
import { LayoutMath } from "./LayoutMath";
import { Coordinates } from "./Coordinates";
import { getLocalParticipantNames } from "./LocalParticipants";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "./FrameBorder";
import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import { FRAGMENT_MIN_WIDTH } from "./Constants";

/**
 * Fragment布局计算器
 * 提供清晰、统一的Fragment布局计算接口
 */
export class FragmentLayoutCalculator {
  private readonly extractor: ParticipantGeometryExtractor;
  private readonly coordinates: Coordinates;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
    this.extractor = new ParticipantGeometryExtractor(coordinates);
  }

  /**
   * 从context提取Fragment几何数据
   * @param context 上下文对象
   * @param origin 起源参与者名称
   * @returns Fragment几何数据
   */
  extractFragmentGeometry(context: any, origin: string): FragmentGeometry {
    // 获取所有参与者
    const allParticipants = this.coordinates.orderedParticipantNames();
    const localParticipantNames = getLocalParticipantNames(context);
    
    // 提取本地参与者的几何数据
    const localParticipants = this.extractor.extractParticipants(localParticipantNames, context);
    
    // 如果没有本地参与者，使用所有参与者
    const participantsToUse = localParticipants.length > 0 
      ? localParticipants 
      : this.extractor.extractAllParticipants(context);
    
    // 找到最左和最右的参与者
    const leftParticipant = ParticipantGeometryExtractor.getLeftmostParticipant(participantsToUse);
    const rightParticipant = ParticipantGeometryExtractor.getRightmostParticipant(participantsToUse);
    
    // 提取起源参与者数据
    const originParticipant = this.extractor.extractParticipant(origin, context);
    
    // 计算边界深度
    const frameBuilder = new FrameBuilder(allParticipants);
    const frame = frameBuilder.getFrame(context);
    const border = FrameBorder(frame);
    const borderDepth = Math.max(1, border.left / 10); // FRAGMENT_PADDING_X = 10, 至少为1
    
    if (!leftParticipant || !rightParticipant) {
      throw new Error("Could not determine left or right participant for fragment");
    }

    return {
      leftParticipant,
      rightParticipant,
      localParticipants: participantsToUse,
      borderDepth,
      origin: originParticipant,
    };
  }

  /**
   * 计算Fragment的完整布局
   * @param context 上下文对象
   * @param origin 起源参与者名称
   * @returns Fragment布局结果
   */
  calculateFragmentLayout(context: any, origin: string): FragmentLayoutResult {
    const geometry = this.extractFragmentGeometry(context, origin);
    
    // 使用统一数学模型计算各项值
    const offsetX = LayoutMath.fragmentTotalOffset(
      geometry.leftParticipant,
      geometry.origin,
      geometry.borderDepth
    );
    
    const paddingLeft = LayoutMath.fragmentBaseOffset(
      geometry.leftParticipant,
      geometry.borderDepth
    );
    
    const borderPadding = LayoutMath.fragmentBorderPadding(geometry.borderDepth);
    
    const totalWidth = TotalWidth(context, this.coordinates);
    
    return {
      position: { x: 0, y: 0 }, // Fragment通常没有Y偏移
      dimensions: { 
        width: totalWidth, 
        height: 0 // 高度由内容决定
      },
      transform: `translateX(${-(offsetX + 1)}px)`, // 添加1px的调整
      offsetX,
      paddingLeft,
      borderPadding,
    };
  }

  /**
   * 生成Fragment的CSS样式对象
   * @param context 上下文对象
   * @param origin 起源参与者名称
   * @returns CSS样式对象
   */
  generateFragmentStyle(context: any, origin: string): object {
    const layout = this.calculateFragmentLayout(context, origin);
    
    return {
      transform: layout.transform,
      width: `${layout.dimensions.width}px`,
      minWidth: `${FRAGMENT_MIN_WIDTH}px`,
    };
  }

  /**
   * 获取Fragment的左边距
   * @param context 上下文对象
   * @returns 左边距值
   */
  getFragmentPaddingLeft(context: any): number {
    const geometry = this.extractFragmentGeometry(context, ""); // 无需origin来计算padding
    return LayoutMath.fragmentBaseOffset(geometry.leftParticipant, geometry.borderDepth);
  }

  /**
   * 获取Fragment的偏移量（用于特定计算）
   * @param context 上下文对象
   * @param origin 起源参与者名称
   * @returns 偏移量
   */
  getFragmentOffset(context: any, origin: string): number {
    const geometry = this.extractFragmentGeometry(context, origin);
    return LayoutMath.fragmentTotalOffset(
      geometry.leftParticipant,
      geometry.origin,
      geometry.borderDepth
    );
  }

  /**
   * 获取Fragment的边界信息
   * @param context 上下文对象
   * @returns 边界信息
   */
  getFragmentBorder(context: any): { left: number; right: number } {
    const geometry = this.extractFragmentGeometry(context, "");
    return LayoutMath.fragmentBorderPadding(geometry.borderDepth);
  }

  /**
   * 获取Fragment的最左参与者名称
   * @param context 上下文对象
   * @returns 最左参与者名称
   */
  getLeftParticipantName(context: any): string {
    const geometry = this.extractFragmentGeometry(context, "");
    return geometry.leftParticipant.name;
  }
}