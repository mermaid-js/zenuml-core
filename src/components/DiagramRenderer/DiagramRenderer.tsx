import React from 'react';
import { DiagramLayout, ParticipantLayout, InteractionLayout, FragmentLayout, ActivationLayout, DividerLayout } from '@/domain/models/DiagramLayout';
import { cn } from '@/utils';

/**
 * Pure rendering components that only depend on layout data.
 * No knowledge of parse trees or contexts.
 */

interface DiagramRendererProps {
  layout: DiagramLayout;
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({ layout }) => {
  return (
    <svg width={layout.width} height={layout.height} className="sequence-diagram">
      {/* Render participants */}
      {layout.participants.map(participant => (
        <ParticipantRenderer key={participant.participantId} layout={participant} />
      ))}
      
      {/* Render lifelines */}
      {layout.lifelines.map(lifeline => (
        <LifelineRenderer key={lifeline.participantId} layout={lifeline} />
      ))}
      
      {/* Render fragments (behind interactions) */}
      {layout.fragments.map(fragment => (
        <FragmentRenderer key={fragment.fragmentId} layout={fragment} />
      ))}
      
      {/* Render activations */}
      {layout.activations.map((activation, index) => (
        <ActivationRenderer key={index} layout={activation} />
      ))}
      
      {/* Render dividers */}
      {layout.dividers.map((divider, index) => (
        <DividerRenderer key={index} layout={divider} />
      ))}
      
      {/* Render interactions */}
      {layout.interactions.map(interaction => (
        <InteractionRenderer key={interaction.interactionId} layout={interaction} />
      ))}
    </svg>
  );
};

interface ParticipantRendererProps {
  layout: ParticipantLayout;
}

const ParticipantRenderer: React.FC<ParticipantRendererProps> = ({ layout }) => {
  return (
    <g className="participant">
      <rect
        x={layout.bounds.x}
        y={layout.bounds.y}
        width={layout.bounds.width}
        height={layout.bounds.height}
        className="participant-box"
        fill="#f0f0f0"
        stroke="#333"
      />
      <text
        x={layout.labelBounds.x + layout.labelBounds.width / 2}
        y={layout.labelBounds.y + layout.labelBounds.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        className="participant-label"
      >
        {/* Label will be provided by domain model lookup */}
      </text>
    </g>
  );
};

interface LifelineRendererProps {
  layout: {
    x: number;
    startY: number;
    endY: number;
  };
}

const LifelineRenderer: React.FC<LifelineRendererProps> = ({ layout }) => {
  return (
    <line
      x1={layout.x}
      y1={layout.startY}
      x2={layout.x}
      y2={layout.endY}
      stroke="#333"
      strokeDasharray="5,5"
      className="lifeline"
    />
  );
};

interface InteractionRendererProps {
  layout: InteractionLayout;
}

const InteractionRenderer: React.FC<InteractionRendererProps> = ({ layout }) => {
  const { startPoint, endPoint, arrowStyle } = layout;
  
  if (arrowStyle.selfMessage) {
    // Render self message
    return (
      <g className="interaction self-message">
        <path
          d={`M ${startPoint.x} ${startPoint.y} 
              L ${endPoint.x} ${startPoint.y}
              L ${endPoint.x} ${endPoint.y}
              L ${startPoint.x} ${endPoint.y}`}
          fill="none"
          stroke="#333"
          strokeDasharray={arrowStyle.lineType === 'dashed' ? '5,5' : undefined}
        />
        <ArrowHead 
          x={startPoint.x} 
          y={endPoint.y} 
          direction="left" 
          type={arrowStyle.arrowHead} 
        />
      </g>
    );
  }
  
  return (
    <g className="interaction">
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="#333"
        strokeDasharray={arrowStyle.lineType === 'dashed' ? '5,5' : undefined}
      />
      <ArrowHead 
        x={endPoint.x} 
        y={endPoint.y} 
        direction={startPoint.x < endPoint.x ? 'right' : 'left'} 
        type={arrowStyle.arrowHead} 
      />
    </g>
  );
};

interface FragmentRendererProps {
  layout: FragmentLayout;
}

const FragmentRenderer: React.FC<FragmentRendererProps> = ({ layout }) => {
  return (
    <g className={`fragment fragment-${layout.type}`}>
      <rect
        x={layout.bounds.x}
        y={layout.bounds.y}
        width={layout.bounds.width}
        height={layout.bounds.height}
        fill="none"
        stroke="#333"
        className="fragment-border"
      />
      <rect
        x={layout.headerBounds.x}
        y={layout.headerBounds.y}
        width={layout.headerBounds.width}
        height={layout.headerBounds.height}
        fill="#e0e0e0"
        stroke="#333"
        className="fragment-header"
      />
      <text
        x={layout.headerBounds.x + 5}
        y={layout.headerBounds.y + layout.headerBounds.height / 2}
        dominantBaseline="middle"
        className="fragment-label"
      >
        {layout.type}
      </text>
      
      {/* Render section dividers */}
      {layout.sections.slice(1).map((section, index) => (
        <line
          key={index}
          x1={section.bounds.x}
          y1={section.bounds.y}
          x2={section.bounds.x + section.bounds.width}
          y2={section.bounds.y}
          stroke="#333"
          strokeDasharray="5,5"
          className="fragment-section-divider"
        />
      ))}
    </g>
  );
};

interface ActivationRendererProps {
  layout: ActivationLayout;
}

const ActivationRenderer: React.FC<ActivationRendererProps> = ({ layout }) => {
  return (
    <rect
      x={layout.bounds.x}
      y={layout.bounds.y}
      width={layout.bounds.width}
      height={layout.bounds.height}
      fill="#fff"
      stroke="#333"
      className="activation"
    />
  );
};

interface ArrowHeadProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
  type: 'filled' | 'open';
}

const ArrowHead: React.FC<ArrowHeadProps> = ({ x, y, direction, type }) => {
  const size = 10;
  const dx = direction === 'right' ? -size : size;
  
  if (type === 'filled') {
    return (
      <polygon
        points={`${x},${y} ${x + dx},${y - size/2} ${x + dx},${y + size/2}`}
        fill="#333"
      />
    );
  }
  
  return (
    <polyline
      points={`${x + dx},${y - size/2} ${x},${y} ${x + dx},${y + size/2}`}
      fill="none"
      stroke="#333"
      strokeWidth="2"
    />
  );
};

interface DividerRendererProps {
  layout: DividerLayout;
}

const DividerRenderer: React.FC<DividerRendererProps> = ({ layout }) => {
  return (
    <g className="divider">
      {/* Left line */}
      <line
        x1={layout.bounds.x}
        y1={layout.bounds.y + layout.bounds.height / 2}
        x2={layout.labelBounds.x - 5}
        y2={layout.bounds.y + layout.bounds.height / 2}
        stroke="#666"
        strokeDasharray="5,5"
        className="divider-line"
      />
      
      {/* Label */}
      <text
        x={layout.labelBounds.x + layout.labelBounds.width / 2}
        y={layout.labelBounds.y + layout.labelBounds.height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={layout.style?.textStyle}
        className={cn('divider-text', ...(layout.style?.classNames || []))}
      >
        {layout.text}
      </text>
      
      {/* Right line */}
      <line
        x1={layout.labelBounds.x + layout.labelBounds.width + 5}
        y1={layout.bounds.y + layout.bounds.height / 2}
        x2={layout.bounds.x + layout.bounds.width}
        y2={layout.bounds.y + layout.bounds.height / 2}
        stroke="#666"
        strokeDasharray="5,5"
        className="divider-line"
      />
    </g>
  );
};