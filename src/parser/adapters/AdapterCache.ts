// src/parser/adapters/AdapterCache.ts
import { SequenceASTNode } from "../types/astNode.types";

/**
 * Adapter cache that preserves instances for unchanged nodes
 * Uses weak references to allow garbage collection
 */
export class AdapterCache {
  private static instance: AdapterCache;
  private cache = new WeakMap<any, SequenceASTNode>();
  private propertyCache = new WeakMap<SequenceASTNode, Map<string, any>>();

  static getInstance(): AdapterCache {
    if (!AdapterCache.instance) {
      AdapterCache.instance = new AdapterCache();
    }
    return AdapterCache.instance;
  }

  /**
   * Get or create an adapter for a parser node
   * Reuses existing adapter if the underlying node hasn't changed
   */
  getAdapter<T extends SequenceASTNode>(
    parserNode: any,
    adapterFactory: (node: any) => T,
    hasChanged: (node: any) => boolean = () => false,
  ): T {
    // Check if we have a cached adapter
    const cached = this.cache.get(parserNode);

    // If cached and node hasn't changed, return the same instance
    if (cached && !hasChanged(parserNode)) {
      return cached as T;
    }

    // Create new adapter
    const adapter = adapterFactory(parserNode);
    this.cache.set(parserNode, adapter);

    // Clear property cache for this adapter
    this.propertyCache.delete(adapter);

    return adapter;
  }

  /**
   * Get or compute a property value with caching
   */
  getCachedProperty<T>(
    adapter: SequenceASTNode,
    propertyName: string,
    compute: () => T,
  ): T {
    let properties = this.propertyCache.get(adapter);

    if (!properties) {
      properties = new Map();
      this.propertyCache.set(adapter, properties);
    }

    if (properties.has(propertyName)) {
      return properties.get(propertyName);
    }

    const value = compute();
    properties.set(propertyName, value);
    return value;
  }

  /**
   * Clear cache for specific nodes (useful for incremental updates)
   */
  invalidateNode(parserNode: any): void {
    const adapter = this.cache.get(parserNode);
    if (adapter) {
      this.propertyCache.delete(adapter);
      this.cache.delete(parserNode);
    }
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.cache = new WeakMap();
    this.propertyCache = new WeakMap();
  }
}
