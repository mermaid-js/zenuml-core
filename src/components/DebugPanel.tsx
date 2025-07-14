import React, { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { diagramLayoutAtom, domainModelAtom } from '@/domain/DomainModelStore';
import { enableLayoutComparisonAtom, layoutComparisonAtom } from '@/store/Store';
import { LayoutComparison } from '@/utils/LayoutComparison';

/**
 * Debug panel to show new architecture data and layout comparison
 */
export const DebugPanel = () => {
  const domainModel = useAtomValue(domainModelAtom);
  const diagramLayout = useAtomValue(diagramLayoutAtom);
  const [enableComparison, setEnableComparison] = useAtom(enableLayoutComparisonAtom);
  const comparisonMetrics = useAtomValue(layoutComparisonAtom);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Hide in test environments
  if (typeof window !== 'undefined' && (window.location.pathname.includes('/cy/') || window.location.pathname.includes('/test'))) {
    return null;
  }
  
  if (!domainModel || !diagramLayout) {
    return null;
  }

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: 5,
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 1000,
        cursor: 'pointer'
      }} onClick={() => setIsMinimized(false)}>
        📊 Debug Panel
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 350,
      maxHeight: 500,
      overflow: 'auto',
      background: 'rgba(0, 0, 0, 0.9)',
      color: 'white',
      padding: 10,
      borderRadius: 5,
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🚀 Architecture Comparison</h3>
        <button 
          onClick={() => setIsMinimized(true)}
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
        >
          ─
        </button>
      </div>

      <div style={{ marginBottom: 10, borderBottom: '1px solid #444', paddingBottom: 10 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <input
            type="checkbox"
            checked={enableComparison}
            onChange={(e) => setEnableComparison(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Layout Comparison {enableComparison ? '(Auto-logging to console)' : '(Disabled)'}
        </label>
      </div>

      {enableComparison && comparisonMetrics && (
        <details open>
          <summary style={{ color: '#ffd700', marginBottom: 5 }}>
            📊 Comparison Results
          </summary>
          <div style={{ marginLeft: 20, marginBottom: 10 }}>
            <div style={{ marginBottom: 5 }}>
              <strong>Total Width:</strong><br/>
              Old: {comparisonMetrics.totalWidth.old.toFixed(0)}px → 
              New: {comparisonMetrics.totalWidth.new.toFixed(0)}px
              (Δ{comparisonMetrics.totalWidth.diff.toFixed(0)}px)
            </div>
            
            <details>
              <summary>Participant Positions</summary>
              <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                {Object.entries(comparisonMetrics.participantPositions).map(([name, data]) => (
                  <li key={name} style={{ color: data.diff > 5 ? '#ff6b6b' : '#4ecdc4' }}>
                    {name}: {data.old.toFixed(0)} → {data.new.toFixed(0)} 
                    (Δ{data.diff.toFixed(0)}px)
                  </li>
                ))}
              </ul>
            </details>

            <details>
              <summary>Participant Widths</summary>
              <ul style={{ margin: '5px 0', paddingLeft: 20 }}>
                {Object.entries(comparisonMetrics.participantWidths).map(([name, data]) => (
                  <li key={name} style={{ color: data.diff > 5 ? '#ff6b6b' : '#4ecdc4' }}>
                    {name}: {data.old.toFixed(0)} → {data.new.toFixed(0)} 
                    (Δ{data.diff.toFixed(0)}px)
                  </li>
                ))}
              </ul>
            </details>

            {comparisonMetrics.messagePositions.length > 0 && (
              <details>
                <summary>Message Positions ({comparisonMetrics.messagePositions.length})</summary>
                <ul style={{ margin: '5px 0', paddingLeft: 20, maxHeight: 100, overflow: 'auto' }}>
                  {comparisonMetrics.messagePositions.slice(0, 10).map((msg, i) => (
                    <li key={i} style={{ marginBottom: 5 }}>
                      {msg.message}:<br/>
                      From: Δ{msg.fromPosition.diff.toFixed(0)}px, 
                      To: Δ{msg.toPosition.diff.toFixed(0)}px
                    </li>
                  ))}
                  {comparisonMetrics.messagePositions.length > 10 && <li>...</li>}
                </ul>
              </details>
            )}

            <button
              onClick={() => LayoutComparison.visualize()}
              style={{
                marginTop: 10,
                padding: '5px 10px',
                background: '#4ecdc4',
                border: 'none',
                borderRadius: 3,
                color: 'black',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Visualize Differences
            </button>
          </div>
        </details>
      )}
      
      <details>
        <summary>New Architecture Data</summary>
        <div style={{ marginLeft: 20 }}>
          <details>
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
        </div>
      </details>
    </div>
  );
};