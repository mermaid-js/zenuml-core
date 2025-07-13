import { useMemo } from "react";
import { LayoutGeometryExtractor } from "../extractor/LayoutGeometryExtractor";
import { LayoutEngine, DiagramLayout } from "../engine/LayoutEngine";
import { LayoutGeometry } from "../geometry/LayoutGeometry";
import { LayoutCache, HashGenerator } from "../cache/LayoutCache";

/**
 * Unified layout hook that provides all layout calculations with caching
 * This replaces individual hooks like useArrow, useFragmentData, etc.
 */
export const useUnifiedLayout = (context: any): DiagramLayout => {
  // Extract geometric data from context with caching
  const geometry = useMemo(() => {
    const contextHash = HashGenerator.hashContext(context);
    
    // Try to get from cache first
    let cachedGeometry = LayoutCache.getGeometry(contextHash);
    if (cachedGeometry) {
      console.log('📦 Cache hit: LayoutGeometry');
      return cachedGeometry;
    }
    
    // Extract from context and cache the result
    console.time('🔄 LayoutGeometry extraction');
    const extractedGeometry = LayoutGeometryExtractor.extractFromContext(context);
    console.timeEnd('🔄 LayoutGeometry extraction');
    
    LayoutCache.setGeometry(contextHash, extractedGeometry);
    console.log('💾 Cached: LayoutGeometry');
    
    return extractedGeometry;
  }, [context]);

  // Calculate complete layout with caching
  const layout = useMemo(() => {
    const geometryHash = HashGenerator.hashGeometry(geometry);
    
    // Try to get from cache first
    let cachedLayout = LayoutCache.getLayout(geometryHash);
    if (cachedLayout) {
      console.log('📦 Cache hit: DiagramLayout');
      return cachedLayout;
    }
    
    // Calculate layout and cache the result
    console.time('🧮 Layout calculation');
    const engine = new LayoutEngine();
    const calculatedLayout = engine.calculateCompleteLayout(geometry);
    console.timeEnd('🧮 Layout calculation');
    
    LayoutCache.setLayout(geometryHash, calculatedLayout);
    console.log('💾 Cached: DiagramLayout');
    
    return calculatedLayout;
  }, [geometry]);

  return layout;
};

/**
 * Hook for accessing just the geometry data
 * Useful for components that only need structural information
 */
export const useLayoutGeometry = (context: any): LayoutGeometry => {
  return useMemo(() => 
    LayoutGeometryExtractor.extractFromContext(context), 
    [context]
  );
};

/**
 * Specialized hook for fragment data that maintains backward compatibility
 * with the existing useFragmentData interface
 */
export const useFragmentDataV2 = (context: any, origin: string) => {
  const layout = useUnifiedLayout(context);
  
  // Find the fragment that corresponds to this context
  const fragmentId = useMemo(() => {
    // This would need logic to identify which fragment this context represents
    // For now, we'll use a simplified approach
    return `fragment_0`; // Placeholder
  }, [context]);

  const fragmentBounds = layout.fragmentBounds.find(fb => fb.fragmentId === fragmentId);
  
  if (!fragmentBounds) {
    // Fallback to basic calculations if fragment not found
    return {
      collapsed: false,
      toggleCollapse: () => {},
      paddingLeft: 0,
      fragmentStyle: {},
      border: { left: 0, right: 0 },
      leftParticipant: origin,
    };
  }

  // State for collapse functionality (would need to be managed properly)
  const collapsed = false; // This would need proper state management
  const toggleCollapse = () => {}; // This would need proper implementation

  return {
    collapsed,
    toggleCollapse,
    paddingLeft: fragmentBounds.bounds.paddingLeft,
    fragmentStyle: {
      transform: `translateX(${-fragmentBounds.bounds.offsetX}px)`,
      width: `${fragmentBounds.bounds.width}px`,
      minWidth: `${fragmentBounds.bounds.minWidth}px`,
    },
    border: {
      left: fragmentBounds.bounds.left,
      right: fragmentBounds.bounds.right,
    },
    leftParticipant: origin, // This would need proper calculation
  };
};

/**
 * Specialized hook for arrow data that maintains backward compatibility
 */
export const useArrowV2 = ({
  context,
  origin,
  source, 
  target,
}: {
  context: any;
  origin: string;
  source: string;
  target: string;
}) => {
  const layout = useUnifiedLayout(context);
  
  // Find the message that corresponds to this arrow
  const messageId = useMemo(() => {
    // This would need logic to identify which message this represents
    return `message_0`; // Placeholder
  }, [context, source, target]);

  const arrowLayout = layout.arrowLayouts.find(al => al.messageId === messageId);
  
  if (!arrowLayout) {
    throw new Error(`Arrow layout not found for message ${messageId}`);
  }

  return arrowLayout.layout;
};