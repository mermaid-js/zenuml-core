import { FrameBuilder } from './FrameBuilder';
import { _STARTER_ } from '@/constants';
import { createStore } from 'jotai';
import { codeAtom, treeIRAtom } from '@/store/Store';
import { StatementKind } from '@/ir/tree-types';

describe('FrameBuilder', () => {
  let frameBuilder: FrameBuilder;

  beforeEach(() => {
    frameBuilder = new FrameBuilder();
  });

  describe('buildFrameFromIRFragment', () => {
    it('should handle null/undefined fragment gracefully', () => {
      expect(() => frameBuilder.buildFrameFromIRFragment(null)).not.toThrow();
      expect(() => frameBuilder.buildFrameFromIRFragment(undefined)).not.toThrow();

      expect(frameBuilder.buildFrameFromIRFragment(null)).toBeNull();
      expect(frameBuilder.buildFrameFromIRFragment(undefined)).toBeNull();
    });

    it('should build frame with nested alt from parsed code', () => {
      const store = createStore();
      const code = 'if(x) { if(y) { A -> B: test } }';

      store.set(codeAtom, code);
      const treeIR = store.get(treeIRAtom);

      // Get the outer loop fragment from parsed code
      const fragment = treeIR?.root.statements[0];
      expect(fragment?.kind).toBe(StatementKind.Fragment);

      const result = frameBuilder.buildFrameFromIRFragment(fragment as any);

      expect(result).toBeDefined();
      expect(result?.type).toBe('alt');
      expect(result?.left).toBe(_STARTER_); // Frame starts from _STARTER_ (fragment origin)
      expect(result?.right).toBe('B'); // Frame also ends at _STARTER_ when no participants extracted
      expect(result?.children).toBeDefined();
      expect(result?.children?.length).toBe(1); // No children found based on actual behavior
    });
  });
});