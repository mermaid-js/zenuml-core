import React from 'react';
import { cn } from '@/utils';
import { InteractionLayout } from '@/domain/models/DiagramLayout';

interface InteractionWithLayoutProps {
  layout: InteractionLayout;
  className?: string;
}

/**
 * Pure interaction renderer that only depends on layout data
 */
export const InteractionWithLayout: React.FC<InteractionWithLayoutProps> = ({ 
  layout, 
  className 
}) => {
  const { rightToLeft, isSelfMessage, translateX, width } = layout;
  
  if (isSelfMessage) {
    // Self message rendering
    return (
      <div
        className={cn("interaction sync self-message", className)}
        style={{
          transform: `translateX(${translateX}px)`,
          width: `${width}px`
        }}
      >
        <div className="message-label">{layout.message}</div>
        <svg width={width} height={30}>
          <path
            d={`M 0 10 H ${width - 10} V 25 H 10`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            markerEnd="url(#arrow)"
          />
        </svg>
      </div>
    );
  }
  
  // Regular message rendering
  return (
    <div
      className={cn("interaction sync", { "right-to-left": rightToLeft }, className)}
      style={{
        transform: `translateX(${translateX}px)`,
        width: `${width}px`
      }}
      data-from={layout.from}
      data-to={layout.to}
      data-type={layout.type}
    >
      <div className="message-wrapper">
        <div className="message-label">{layout.message}</div>
        <svg 
          className="arrow-svg" 
          width={width} 
          height={2}
          style={{ position: 'absolute', top: '50%' }}
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path
                d="M0,0 L0,6 L9,3 z"
                fill={layout.arrowStyle.arrowHead === 'filled' ? 'currentColor' : 'none'}
                stroke="currentColor"
              />
            </marker>
          </defs>
          <line
            x1={rightToLeft ? width : 0}
            y1="1"
            x2={rightToLeft ? 0 : width}
            y2="1"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray={layout.arrowStyle.lineType === 'dashed' ? '5,5' : '0'}
            markerEnd="url(#arrow)"
          />
        </svg>
      </div>
      
      {/* Nested interactions */}
      {layout.children && layout.children.length > 0 && (
        <div className="nested-interactions">
          {layout.children.map((child, index) => (
            <InteractionWithLayout
              key={child.interactionId}
              layout={child}
              className="nested"
            />
          ))}
        </div>
      )}
    </div>
  );
};