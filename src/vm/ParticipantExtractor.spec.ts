import { ParticipantExtractor } from './ParticipantExtractor';
import { _STARTER_ } from '@/constants';
import { StatementKind } from '@/ir/tree-types';

describe('ParticipantExtractor', () => {
  let extractor: ParticipantExtractor;

  beforeEach(() => {
    extractor = new ParticipantExtractor();
  });

  describe('extractFromStatement', () => {

    it('should extract participants from statement with ifBlockVM', () => {
      const statement = {
        kind: StatementKind.Fragment,
        fragmentType: 'alt',
        origin: _STARTER_,
        ifBlock: {
          statements: [
            {
              kind: StatementKind.Message,
              from: 'A',
              to: 'B',
              origin: 'A',
            },
            {
              kind: StatementKind.Message,
              from: 'B',
              to: 'C',
              origin: 'B',
            }
          ],
          origin: 'A',
        },
      };

      const result = extractor.extractFromStatement(statement);

      expect(result).toEqual(['A', 'B', 'C']);
    });

    it('should extract participants from statement with fragmentBody', () => {
      const statement = {
        kind: 'loop',
        fragmentType: 'loop',
        origin: _STARTER_,
        statements: [
          {
            kind: StatementKind.Message,
            from: 'X',
            to: 'Y',
            origin: 'X',
          }
        ],
      };

      const result = extractor.extractFromStatement(statement);

      expect(result).toEqual(['X', 'Y']);
    });
  });


  describe('edge cases', () => {
    it('should handle statements with null/undefined from/to', () => {
      const statement = {
        kind: StatementKind.Message,
        from: null,
        to: 'A',
        origin: _STARTER_,
      };

      const result = extractor.extractFromStatement(statement);

      expect(result).toEqual(['A']);
    });

    it('should handle statements with empty string from/to', () => {
      const statement = {
        kind: StatementKind.Message,
        from: '',
        to: 'A',
        origin: _STARTER_,
      };

      const result = extractor.extractFromStatement(statement);

      expect(result).toEqual(['A']);
    });

    it('should handle null/undefined statement', () => {
      expect(() => extractor.extractFromStatement(null)).not.toThrow();
      const result = extractor.extractFromStatement(null);
      expect(result).toEqual([]);
    });

    it('should handle fragment statement without nested blocks', () => {
      const statement = {
        kind: 'alt',
        fragmentType: 'alt',
        origin: _STARTER_,
        // No ifBlockVM or fragmentBody
      };

      const result = extractor.extractFromStatement(statement);

      expect(result).toEqual([]);
    });

    it('should handle nested fragments with empty statements', () => {
      const statement = {
        kind: 'alt',
        fragmentType: 'alt',
        origin: _STARTER_,
        ifBlock: {
          statements: [],
        },
      };

      const result = extractor.extractFromStatement(statement);

      expect(result).toEqual([]);
    });
  });
});