import React from 'react';
import { useAtomValue } from 'jotai';
import { domainModelAtom, diagramLayoutAtom } from '@/domain/DomainModelStore';
import { cn } from '@/utils';

/**
 * New Divider component that uses domain model and layout instead of context.
 * This is a migration example showing how components can be refactored.
 */

interface NewDividerProps {
  statementIndex: number; // Index in the parent block's statements
  className?: string;
}

export const NewDivider: React.FC<NewDividerProps> = ({ statementIndex, className }) => {
  const domainModel = useAtomValue(domainModelAtom);
  const layout = useAtomValue(diagramLayoutAtom);
  
  if (!domainModel || !layout) return null;
  
  // Find the divider in the domain model
  // In a real implementation, we'd have a better way to map statement indices
  const statement = domainModel.rootBlock.statements[statementIndex];
  if (!statement || statement.type !== 'divider') return null;
  
  // Find the corresponding layout
  const dividerLayout = layout.dividers.find((d, index) => {
    // In a real implementation, we'd match by ID
    return index === statementIndex;
  });
  
  if (!dividerLayout) return null;
  
  // Render using pre-calculated layout
  return (
    <div
      className={cn("divider", className)}
      style={{
        position: 'absolute',
        left: dividerLayout.bounds.x + 'px',
        top: dividerLayout.bounds.y + 'px',
        width: dividerLayout.bounds.width + 'px',
        height: dividerLayout.bounds.height + 'px',
      }}
    >
      <div className="left bg-skin-divider" style={{ 
        position: 'absolute',
        left: 0,
        top: '50%',
        width: (dividerLayout.labelBounds.x - dividerLayout.bounds.x - 5) + 'px',
        height: '1px',
        transform: 'translateY(-50%)'
      }}></div>
      
      <div
        style={{
          ...dividerLayout.style?.textStyle,
          position: 'absolute',
          left: dividerLayout.labelBounds.x + 'px',
          top: dividerLayout.labelBounds.y + 'px',
          width: dividerLayout.labelBounds.width + 'px',
          height: dividerLayout.labelBounds.height + 'px',
          textAlign: 'center',
          lineHeight: dividerLayout.labelBounds.height + 'px'
        }}
        className={cn("name", ...(dividerLayout.style?.classNames || []))}
      >
        {dividerLayout.text}
      </div>
      
      <div className="right bg-skin-divider" style={{
        position: 'absolute',
        left: (dividerLayout.labelBounds.x + dividerLayout.labelBounds.width + 5) + 'px',
        top: '50%',
        width: (dividerLayout.bounds.x + dividerLayout.bounds.width - dividerLayout.labelBounds.x - dividerLayout.labelBounds.width - 5) + 'px',
        height: '1px',
        transform: 'translateY(-50%)'
      }}></div>
    </div>
  );
};

/**
 * Comparison wrapper to show old vs new implementation side by side
 */
export const DividerComparison: React.FC<{ context: any; origin: string }> = ({ context, origin }) => {
  const domainModel = useAtomValue(domainModelAtom);
  
  if (!domainModel) {
    // Fallback to old implementation if domain model not available
    return null;
  }
  
  // For now, just render the old version
  // In production, we'd switch based on a feature flag
  return null;
};