# React Performance Optimization Plan for AST Adapter Architecture

## Executive Summary

This plan outlines strategies to optimize React performance when using AST adapter objects instead of plain objects in the ZenUML parser abstraction. The key challenge is that adapter objects with methods don't work well with standard React memoization, but we can leverage the fact that DSL changes are local and incremental to implement highly effective caching strategies.

## Problem Analysis

### Current Challenge

```typescript
// Before: Plain ANTLR context objects (easy to memoize)
const context = { type: "MessageContext", text: "A->B: hello" };

// After: Adapter objects with methods (harder to memoize)
const node = new MessageAdapter(context);
// node.getFrom(), node.getTo(), node.getSignature()
```

### Key Issues

1. **Identity Instability**: New adapter instances created on each parse
2. **Method-based Properties**: `node.getFrom()` vs `node.from` - breaks shallow comparison
3. **Nested Object Creation**: Each property access might create new objects
4. **React.memo Ineffectiveness**: Standard React.memo can't compare method-based objects effectively

### Key Insight: Local and Incremental Changes

Since DSL changes are typically local and incremental:

- Most AST nodes remain unchanged between edits
- Only a small subset of nodes need re-creation
- We can implement structural sharing and caching strategies

## Solution Architecture

### Core Strategy: Three-Layer Caching

```
User DSL Change → Parser → Adapter Cache → Property Cache → React Components
     ↓              ↓           ↓              ↓              ↓
  Local Edit    → AST Tree → Same Instances → Cached Values → No Re-renders
```

### 1. Structural Sharing Layer

**Purpose**: Preserve adapter instances for unchanged AST nodes

**Implementation**:

- WeakMap-based cache keyed by parser nodes
- Change detection to determine if nodes need new adapters
- Automatic cleanup through garbage collection

### 2. Property Memoization Layer

**Purpose**: Cache expensive property computations within adapters

**Implementation**:

- Internal property cache within each adapter
- Lazy evaluation of expensive operations
- Cache invalidation on adapter creation

### 3. React Optimization Layer

**Purpose**: Optimize React re-rendering with custom comparison

**Implementation**:

- Custom React.memo comparison functions
- Selector hooks for specific properties
- Component-level memoization strategies

## Implementation Plan

### Phase 1: Foundation Infrastructure

#### 1.1 Enhanced Adapter Cache System

```typescript
// Core caching system
class AdapterCache {
  // Instance cache for structural sharing
  private nodeCache = new WeakMap<ParserNode, ASTAdapter>();

  // Property cache for expensive computations
  private propertyCache = new WeakMap<ASTAdapter, Map<string, any>>();

  // Change detection
  private nodeVersions = new WeakMap<ParserNode, number>();
}
```

**Features**:

- ✅ WeakMap-based caching for automatic cleanup
- ✅ Change detection through version tracking
- ✅ Property-level caching within adapters
- ✅ Incremental invalidation for changed nodes

#### 1.2 Memoized Adapter Base Class

```typescript
// Base class with built-in memoization
abstract class MemoizedAdapter implements SequenceASTNode {
  // Cached property getters
  get type(): string {
    return this.cached("type", () => this.getType());
  }
  get range(): [number, number] {
    return this.cached("range", () => this.getRange());
  }
  get children(): SequenceASTNode[] {
    return this.cached("children", () => this.getChildren());
  }
}
```

**Benefits**:

- Properties accessed via getters (consistent API)
- Automatic caching of expensive operations
- Stable property values between access

#### 1.3 Change Detection Strategy

**Parser Integration**:

```typescript
interface ParseUpdate {
  changedRanges: Array<[number, number]>;
  addedNodes: ParserNode[];
  removedNodes: ParserNode[];
  modifiedNodes: ParserNode[];
}
```

**Cache Invalidation**:

- Only invalidate adapters for changed nodes
- Preserve adapters for unchanged subtrees
- Batch invalidation for performance

### Phase 2: React Integration Optimizations

#### 2.1 Custom React.memo Comparisons

```typescript
// Smart comparison functions
export function areNodesEqual<T extends { node: SequenceASTNode }>(
  prev: T,
  next: T,
): boolean {
  // 1. Identity check (fastest)
  if (prev.node === next.node) return true;

  // 2. Structural check (fallback)
  return compareNodeStructure(prev.node, next.node);
}
```

**Comparison Strategy**:

1. **Identity First**: Same adapter instance = no change
2. **Range Comparison**: Compare source positions
3. **Type Comparison**: Compare node types
4. **Property Comparison**: Compare key properties

#### 2.2 Selector Hooks for Specific Properties

```typescript
// Optimized property access
function useNodeProperty<T>(
  node: SequenceASTNode,
  selector: (node: SequenceASTNode) => T,
  deps?: any[]
): T {
  return useMemo(() => selector(node), [node, ...(deps || [])]);
}

// Usage in components
const MessageComponent = ({ node }: { node: MessageNode }) => {
  const from = useNodeProperty(node, n => n.getFrom());
  const to = useNodeProperty(node, n => n.getTo());
  const signature = useNodeProperty(node, n => n.getSignature());

  return <div>{from} -> {to}: {signature}</div>;
};
```

#### 2.3 Component-Level Optimizations

```typescript
// Optimized component structure
const Statement = React.memo<StatementProps>(
  ({ node, ...props }) => {
    // Extract type once (cached internally)
    const nodeType = node.type; // Uses getter with cache

    // Memoize expensive computations
    const componentProps = useMemo(
      () => ({
        className: getClassNames(node, props),
        data: extractNodeData(node),
      }),
      [node, props.collapsed, props.origin],
    );

    // Render based on type
    return renderByType(nodeType, componentProps);
  },
  areNodesEqual, // Custom comparison
);
```

### Phase 3: Advanced Optimization Strategies

#### 3.1 Virtual List Integration

For large diagrams with many statements:

```typescript
// Optimized rendering for large lists
const StatementList = ({ nodes }: { nodes: SequenceASTNode[] }) => {
  const visibleNodes = useVirtualization(nodes, {
    itemHeight: 40,
    overscan: 5,
  });

  return (
    <VirtualList>
      {visibleNodes.map(({ node, index }) => (
        <Statement key={node.range[0]} node={node} index={index} />
      ))}
    </VirtualList>
  );
};
```

#### 3.2 Incremental Rendering

```typescript
// Only re-render affected components
const DiagramRenderer = ({ rootNode }: { rootNode: SequenceASTNode }) => {
  const [changedNodes, setChangedNodes] = useState<Set<SequenceASTNode>>(new Set());

  useEffect(() => {
    const changes = detectChangedNodes(rootNode);
    setChangedNodes(changes);
  }, [rootNode]);

  return (
    <div>
      {rootNode.children.map(child => (
        <Statement
          key={child.range[0]}
          node={child}
          forceUpdate={changedNodes.has(child)}
        />
      ))}
    </div>
  );
};
```

#### 3.3 Property Subscription System

```typescript
// Subscribe to specific property changes
class PropertySubscriptions {
  private subscriptions = new Map<string, Set<() => void>>();

  subscribe(nodeId: string, property: string, callback: () => void) {
    const key = `${nodeId}.${property}`;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    this.subscriptions.get(key)!.add(callback);
  }

  notify(nodeId: string, property: string) {
    const key = `${nodeId}.${property}`;
    const callbacks = this.subscriptions.get(key);
    if (callbacks) {
      callbacks.forEach((callback) => callback());
    }
  }
}
```

## Performance Targets and Metrics

### Baseline Measurements

- **Current**: 3 full AST traversals per update (ToCollector, MessageCollector, FrameBuilder)
- **Parse Time**: ~50ms for medium diagrams (100 statements)
- **Re-render Time**: ~30ms for full component tree update

### Target Performance

- **Parse Time**: <20ms (60% improvement)
- **Re-render Time**: <5ms for local changes (85% improvement)
- **Memory Usage**: <50% increase (acceptable for performance gains)
- **Component Updates**: Only changed subtrees re-render

### Success Metrics

1. **Parsing Performance**

   - Single traversal instead of triple traversal
   - Incremental updates for local changes
   - Sub-20ms parse times for typical diagrams

2. **React Performance**

   - <5ms re-render times for local edits
   - > 90% of components skip re-rendering on local changes
   - Stable performance with diagram size

3. **Memory Efficiency**
   - Bounded memory growth
   - Effective garbage collection
   - No memory leaks from caching

## Implementation Timeline

### Week 1-2: Foundation

- [ ] Implement AdapterCache system
- [ ] Create MemoizedAdapter base class
- [ ] Add change detection infrastructure
- [ ] Write comprehensive tests

### Week 3-4: React Integration

- [ ] Implement custom React.memo comparisons
- [ ] Create selector hooks
- [ ] Optimize key components (Statement, Message, Creation)
- [ ] Add performance monitoring

### Week 5-6: Advanced Optimizations

- [ ] Implement incremental rendering
- [ ] Add virtual list support for large diagrams
- [ ] Property subscription system
- [ ] Performance tuning and optimization

### Week 7: Testing and Validation

- [ ] Performance benchmarking
- [ ] A/B testing with current implementation
- [ ] Memory usage analysis
- [ ] Production validation

## Testing Strategy

### Unit Tests

```typescript
describe("AdapterCache", () => {
  it("should preserve adapter instances for unchanged nodes", () => {
    const cache = new AdapterCache();
    const node1 = cache.getAdapter(parserNode, factory);
    const node2 = cache.getAdapter(parserNode, factory);
    expect(node1).toBe(node2); // Same instance
  });

  it("should invalidate cache when nodes change", () => {
    const cache = new AdapterCache();
    const node1 = cache.getAdapter(parserNode, factory);
    markNodeAsChanged(parserNode);
    const node2 = cache.getAdapter(parserNode, factory);
    expect(node1).not.toBe(node2); // Different instance
  });
});
```

### Integration Tests

```typescript
describe('React Component Performance', () => {
  it('should not re-render unchanged components', () => {
    const renderSpy = jest.fn();
    const TestComponent = React.memo(renderSpy);

    render(<TestComponent node={node} />);
    rerender(<TestComponent node={node} />); // Same node

    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
```

### Performance Tests

```typescript
describe("Performance Benchmarks", () => {
  it("should parse large diagrams in <20ms", async () => {
    const largeSource = generateLargeDiagram(1000); // 1000 statements
    const startTime = performance.now();

    const result = parser.parse(largeSource);

    const parseTime = performance.now() - startTime;
    expect(parseTime).toBeLessThan(20);
  });

  it("should handle incremental updates efficiently", () => {
    const source = "A->B: hello\nB->C: world";
    const tree1 = parser.parse(source);

    const startTime = performance.now();
    const tree2 = parser.parse("A->B: hello\nB->C: modified"); // Local change
    const updateTime = performance.now() - startTime;

    expect(updateTime).toBeLessThan(5); // Incremental update
  });
});
```

## Risk Assessment and Mitigation

### Risks

1. **Memory Leaks from Caching**

   - **Mitigation**: Use WeakMaps for automatic cleanup
   - **Monitoring**: Memory usage tracking in development

2. **Cache Invalidation Bugs**

   - **Mitigation**: Conservative invalidation strategy
   - **Testing**: Comprehensive cache behavior tests

3. **Complexity Overhead**

   - **Mitigation**: Start with simple implementation
   - **Fallback**: Ability to disable caching if needed

4. **Performance Regression**
   - **Mitigation**: Benchmarking throughout development
   - **Rollback**: Feature flags for easy rollback

### Monitoring

```typescript
// Performance monitoring in development
class PerformanceMonitor {
  static trackParse(source: string, fn: () => any) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    console.log(`Parse time: ${duration}ms for ${source.length} chars`);
    return result;
  }

  static trackRender(componentName: string, fn: () => any) {
    const start = performance.now();
    const result = fn();
    const duration = performance.now() - start;

    if (duration > 5) {
      console.warn(`Slow render: ${componentName} took ${duration}ms`);
    }
    return result;
  }
}
```

## Migration Strategy

### Phase 1: Parallel Implementation

- Implement caching system alongside existing code
- No changes to React components initially
- Comprehensive testing of cache behavior

### Phase 2: Gradual Component Updates

- Update components one by one with optimizations
- A/B test performance improvements
- Monitor for regressions

### Phase 3: Full Migration

- Switch all components to optimized versions
- Remove old implementation
- Performance validation

### Rollback Plan

- Feature flags for easy disabling
- Fallback to direct adapter creation
- Performance monitoring alerts

## Success Criteria

### Technical Success

- [ ] Single-pass AST traversal (vs current triple-pass)
- [ ] <20ms parse times for typical diagrams
- [ ] <5ms re-render times for local changes
- [ ] > 90% components skip re-rendering on local edits

### User Experience Success

- [ ] No visible delays during typing
- [ ] Smooth scrolling with large diagrams
- [ ] Responsive UI with complex diagrams
- [ ] No functionality regressions

### Code Quality Success

- [ ] Clean, maintainable cache implementation
- [ ] Comprehensive test coverage
- [ ] Clear performance monitoring
- [ ] Easy to debug and troubleshoot

## Conclusion

This plan provides a comprehensive approach to optimizing React performance with AST adapter objects. By leveraging the incremental nature of DSL changes and implementing a three-layer caching strategy, we can achieve significant performance improvements while maintaining clean, maintainable code.

The key insight is that most AST nodes remain unchanged between edits, allowing us to preserve adapter instances and cached property values, making React's memoization strategies highly effective.
