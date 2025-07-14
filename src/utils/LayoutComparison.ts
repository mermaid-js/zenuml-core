import { Coordinates } from '@/positioning/Coordinates';
import { DiagramLayout } from '@/domain/models/DiagramLayout';
import { DomainModelStore } from '@/domain/DomainModelStore';

export interface ComparisonMetrics {
  participantPositions: Record<string, {
    old: number;
    new: number;
    diff: number;
  }>;
  participantWidths: Record<string, {
    old: number;
    new: number;
    diff: number;
  }>;
  totalWidth: {
    old: number;
    new: number;
    diff: number;
  };
  messagePositions: Array<{
    message: string;
    fromPosition: { old: number; new: number; diff: number };
    toPosition: { old: number; new: number; diff: number };
    width: { old: number; new: number; diff: number };
  }>;
}

export class LayoutComparison {
  private static enabled = false;
  private static metrics: ComparisonMetrics | null = null;

  static enable() {
    this.enabled = true;
    console.log('[LayoutComparison] Real-time comparison enabled');
  }

  static disable() {
    this.enabled = false;
    console.log('[LayoutComparison] Real-time comparison disabled');
  }

  static compare(
    oldCoordinates: Coordinates | null,
    newLayout: DiagramLayout | null
  ): ComparisonMetrics | null {
    if (!this.enabled || !oldCoordinates || !newLayout) {
      return null;
    }

    const metrics: ComparisonMetrics = {
      participantPositions: {},
      participantWidths: {},
      totalWidth: { old: 0, new: 0, diff: 0 },
      messagePositions: []
    };

    // Compare participant positions
    const oldParticipants = oldCoordinates.orderedParticipantNames();

    for (const participant of newLayout.participants) {
      // Try to match by participantId first, then by label
      let matchName = null;
      if (oldParticipants.includes(participant.participantId)) {
        matchName = participant.participantId;
      } else if (participant.label && oldParticipants.includes(participant.label)) {
        matchName = participant.label;
      }
      
      if (matchName) {
        const oldPos = oldCoordinates.getPosition(matchName);
        const newPos = participant.lifelineX;
        metrics.participantPositions[matchName] = {
          old: oldPos,
          new: newPos,
          diff: Math.abs(newPos - oldPos)
        };

        const oldWidth = oldCoordinates.half(matchName) * 2;
        const newWidth = participant.bounds.width;
        metrics.participantWidths[matchName] = {
          old: oldWidth,
          new: newWidth,
          diff: Math.abs(newWidth - oldWidth)
        };
      } else {
        console.warn(`[LayoutComparison] Could not find match for participant: ${participant.participantId}`);
      }
    }

    // Compare total width
    metrics.totalWidth = {
      old: oldCoordinates.getWidth(),
      new: newLayout.width,
      diff: Math.abs(newLayout.width - oldCoordinates.getWidth())
    };

    // Compare message positions
    for (const interaction of newLayout.interactions) {
      const fromParticipant = newLayout.participants.find(p => p.participantId === interaction.from);
      const toParticipant = newLayout.participants.find(p => p.participantId === interaction.to);
      
      // Find matching names in old system
      let fromNameInOld = null;
      let toNameInOld = null;
      
      if (fromParticipant) {
        if (oldParticipants.includes(fromParticipant.participantId)) {
          fromNameInOld = fromParticipant.participantId;
        } else if (fromParticipant.label && oldParticipants.includes(fromParticipant.label)) {
          fromNameInOld = fromParticipant.label;
        }
      }
      
      if (toParticipant) {
        if (oldParticipants.includes(toParticipant.participantId)) {
          toNameInOld = toParticipant.participantId;
        } else if (toParticipant.label && oldParticipants.includes(toParticipant.label)) {
          toNameInOld = toParticipant.label;
        }
      }

      if (fromNameInOld && toNameInOld) {
        const oldFromPos = oldCoordinates.getPosition(fromNameInOld);
        const oldToPos = oldCoordinates.getPosition(toNameInOld);
        const oldWidth = Math.abs(oldToPos - oldFromPos);

        metrics.messagePositions.push({
          message: interaction.message || interaction.interactionId,
          fromPosition: {
            old: oldFromPos,
            new: interaction.startPoint.x,
            diff: Math.abs(interaction.startPoint.x - oldFromPos)
          },
          toPosition: {
            old: oldToPos,
            new: interaction.endPoint.x,
            diff: Math.abs(interaction.endPoint.x - oldToPos)
          },
          width: {
            old: oldWidth,
            new: interaction.width || 0,
            diff: Math.abs((interaction.width || 0) - oldWidth)
          }
        });
      }
    }

    this.metrics = metrics;
    return metrics;
  }



  static getLatestMetrics(): ComparisonMetrics | null {
    return this.metrics;
  }

  static forceCompare(): ComparisonMetrics | null {
    console.log('[LayoutComparison] Forcing comparison...');
    
    // Try to get store instance from window
    const store = (window as any).__ZENUML_STORE__;
    if (!store) {
      console.error('[LayoutComparison] Store not found on window');
      return null;
    }
    
    const coordinates = store.get((window as any).__ZENUML_COORDINATES_ATOM__);
    const newLayout = store.get((window as any).__ZENUML_LAYOUT_ATOM__);
    
    console.log('[LayoutComparison] Force compare data:', {
      hasCoordinates: !!coordinates,
      hasLayout: !!newLayout
    });
    
    // Temporarily enable for this comparison
    const wasEnabled = this.enabled;
    this.enabled = true;
    const result = this.compare(coordinates, newLayout);
    this.enabled = wasEnabled;
    
    return result;
  }

  static visualize() {
    if (!this.metrics) {
      console.log('[LayoutComparison] No metrics available');
      return;
    }

    // Create a visual overlay on the diagram
    const container = document.querySelector('.zen-uml-container');
    if (!container) return;

    // Remove existing overlay
    const existingOverlay = document.getElementById('layout-comparison-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    const overlay = document.createElement('div');
    overlay.id = 'layout-comparison-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    `;

    // Add visual indicators for differences
    for (const [, data] of Object.entries(this.metrics.participantPositions)) {
      if (data.diff > 2) {
        const marker = document.createElement('div');
        marker.style.cssText = `
          position: absolute;
          left: ${data.new}px;
          top: 50px;
          width: 2px;
          height: 20px;
          background: red;
          opacity: 0.5;
        `;
        
        const label = document.createElement('div');
        label.style.cssText = `
          position: absolute;
          left: ${data.new}px;
          top: 75px;
          font-size: 10px;
          color: red;
          transform: translateX(-50%);
        `;
        label.textContent = `Δ${data.diff.toFixed(0)}px`;
        
        overlay.appendChild(marker);
        overlay.appendChild(label);
      }
    }

    container.appendChild(overlay);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      overlay.remove();
    }, 5000);
  }
}

// Export global for console access
if (typeof window !== 'undefined') {
  (window as any).LayoutComparison = LayoutComparison;
  
  // Add helper for easy testing
  (window as any).compareLayouts = () => {
    console.log('Running layout comparison...');
    LayoutComparison.enable();
    
    // Wait a bit for store to update
    setTimeout(() => {
      const metrics = LayoutComparison.forceCompare();
      if (metrics) {
        console.log('Comparison successful!');
        console.log('Use LayoutComparison.getLatestMetrics() to see results');
        console.log('Use LayoutComparison.visualize() to see visual overlay');
      } else {
        console.log('Comparison failed - check console for details');
      }
    }, 100);
  };
}