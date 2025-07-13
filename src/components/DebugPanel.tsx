import React from 'react';
import { useAtomValue } from 'jotai';
import { diagramLayoutAtom, domainModelAtom } from '@/domain/DomainModelStore';

/**
 * Debug panel to show new architecture data
 */
export const DebugPanel = () => {
  const domainModel = useAtomValue(domainModelAtom);
  const diagramLayout = useAtomValue(diagramLayoutAtom);
  
  // Hide in test environments
  if (typeof window !== 'undefined' && (window.location.pathname.includes('/cy/') || window.location.pathname.includes('/test'))) {
    return null;
  }
  
  if (!domainModel || !diagramLayout) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 300,
      maxHeight: 400,
      overflow: 'auto',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: 10,
      borderRadius: 5,
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>🚀 New Architecture Data</h3>
      
      <details open>
        <summary>Participants ({domainModel.participants.size})</summary>
        <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
          {Array.from(domainModel.participants.values()).map(p => (
            <li key={p.id}>
              {p.name} 
              {p.type !== 'participant' && <span> ({p.type})</span>}
              {p.color && <span style={{ color: p.color }}> ●</span>}
              {p.label && p.label !== p.name && <span> "{p.label}"</span>}
            </li>
          ))}
        </ul>
      </details>
      
      <details>
        <summary>Layout Bounds</summary>
        <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
          {diagramLayout.participants.map(p => (
            <li key={p.participantId}>
              {p.participantId}: x={p.bounds.x}, w={p.bounds.width}
            </li>
          ))}
        </ul>
      </details>
      
      <details>
        <summary>Dividers ({diagramLayout.dividers.length})</summary>
        <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
          {diagramLayout.dividers.map((d, i) => (
            <li key={i}>{d.text}</li>
          ))}
        </ul>
      </details>
      
      <details>
        <summary>Interactions ({domainModel.interactions.length})</summary>
        <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
          {domainModel.interactions.slice(0, 5).map(i => (
            <li key={i.id}>
              {i.from} → {i.to}: {i.message}
            </li>
          ))}
          {domainModel.interactions.length > 5 && <li>...</li>}
        </ul>
      </details>
    </div>
  );
};