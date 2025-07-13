import { LayoutGeometry } from "../geometry/LayoutGeometry";
import { DiagramLayout } from "../engine/LayoutEngine";

/**
 * Layout cache system for optimizing repeated calculations
 * Uses content-based hashing to cache both geometry and layout results
 */
export class LayoutCache {
  private static geometryCache = new Map<string, LayoutGeometry>();
  private static layoutCache = new Map<string, DiagramLayout>();
  private static maxCacheSize = 100; // Prevent memory leaks

  /**
   * Get cached geometry data or null if not found
   */
  static getGeometry(contextHash: string): LayoutGeometry | null {
    return this.geometryCache.get(contextHash) || null;
  }

  /**
   * Cache geometry data with LRU eviction
   */
  static setGeometry(contextHash: string, geometry: LayoutGeometry): void {
    // Simple LRU: remove oldest if cache is full
    if (this.geometryCache.size >= this.maxCacheSize) {
      const firstKey = this.geometryCache.keys().next().value;
      this.geometryCache.delete(firstKey);
    }
    
    this.geometryCache.set(contextHash, geometry);
  }

  /**
   * Get cached layout data or null if not found
   */
  static getLayout(geometryHash: string): DiagramLayout | null {
    return this.layoutCache.get(geometryHash) || null;
  }

  /**
   * Cache layout data with LRU eviction
   */
  static setLayout(geometryHash: string, layout: DiagramLayout): void {
    if (this.layoutCache.size >= this.maxCacheSize) {
      const firstKey = this.layoutCache.keys().next().value;
      this.layoutCache.delete(firstKey);
    }
    
    this.layoutCache.set(geometryHash, layout);
  }

  /**
   * Clear all caches (useful for testing or memory management)
   */
  static clearAll(): void {
    this.geometryCache.clear();
    this.layoutCache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  static getStats(): CacheStats {
    return {
      geometryCacheSize: this.geometryCache.size,
      layoutCacheSize: this.layoutCache.size,
      maxCacheSize: this.maxCacheSize,
    };
  }
}

/**
 * Utility class for generating stable hashes from objects
 */
export class HashGenerator {
  
  /**
   * Generate a stable hash from context structure
   * This is used to determine if the context has changed
   */
  static hashContext(context: any): string {
    try {
      // Simple approach: stringify the context structure
      // In production, you might want a more sophisticated approach
      const contextStructure = this.extractContextStructure(context);
      return this.djb2Hash(JSON.stringify(contextStructure));
    } catch (error) {
      // Fallback to timestamp if hashing fails
      return `fallback_${Date.now()}_${Math.random()}`;
    }
  }

  /**
   * Generate a stable hash from geometry data
   */
  static hashGeometry(geometry: LayoutGeometry): string {
    try {
      // Hash the serializable parts of geometry
      const hashableData = {
        participants: geometry.participants.map(p => ({
          name: p.name,
          centerPosition: p.centerPosition,
          width: p.width,
          labelWidth: p.labelWidth,
          activationStackLength: p.activationStack.length
        })),
        messagesCount: geometry.messages.length,
        fragmentsCount: geometry.fragments.length,
        metadata: geometry.metadata
      };
      
      return this.djb2Hash(JSON.stringify(hashableData));
    } catch (error) {
      return `geometry_fallback_${Date.now()}`;
    }
  }

  /**
   * Extract relevant structure from context for hashing
   */
  private static extractContextStructure(context: any): any {
    if (!context) return null;
    
    // Extract only the structural parts that affect layout
    return {
      type: context.constructor?.name,
      childrenCount: context.children?.length || 0,
      // Add other relevant structural properties
      hasAlt: !!context.alt?.(),
      hasOpt: !!context.opt?.(),
      hasLoop: !!context.loop?.(),
      hasMessage: !!context.message?.(),
      // Include text content that affects layout
      text: context.getText?.() || '',
    };
  }

  /**
   * Simple DJB2 hash algorithm for strings
   */
  private static djb2Hash(str: string): string {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36); // Convert to base36 for shorter strings
  }
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  geometryCacheSize: number;
  layoutCacheSize: number;
  maxCacheSize: number;
}