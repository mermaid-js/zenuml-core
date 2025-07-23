// src/components/optimized/OptimizedStatement.tsx
import React from 'react';
import { SequenceASTNode } from '@/parser/types/astNode.types';
import { areNodesEqual } from '../optimizations/nodeComparisons';

interface StatementProps {
	node: SequenceASTNode;
	origin: string;
	number?: string;
	collapsed?: boolean;
}

/**
 * Optimized Statement component with custom memoization
 */
export const Statement = React.memo<StatementProps>(
	({ node, origin, number, collapsed }) => {
		// Extract properties once using getters
		// These values are memoized inside the adapter
		const nodeType = node.getType();
		const comment = node.getComment?.() || '';

		// Use React.useMemo for expensive computations
		const subProps = React.useMemo(() => ({
			className: cn('text-left text-sm text-skin-message', {
				hidden: collapsed && !node.isReturn?.(),
			}),
			node,
			origin,
			comment,
			number,
		}), [node, origin, comment, number, collapsed]);

		// Render appropriate component based on type
		if (node.isFragment?.()) {
			const fragmentNode = node as FragmentNode;
			switch (fragmentNode.getFragmentType()) {
				case 'loop': return <FragmentLoop {...subProps} />;
				case 'alt': return <FragmentAlt {...subProps} />;
				case 'par': return <FragmentPar {...subProps} />;
				default: return null;
			}
		}

		if (node.isCreation?.()) {
			return <Creation {...subProps} />;
		}

		if (node.isMessage?.()) {
			return <Interaction {...subProps} />;
		}

		if (node.isAsyncMessage?.()) {
			return <InteractionAsync {...subProps} />;
		}

		return null;
	},
	areNodesEqual // Custom comparison function
);

Statement.displayName = 'Statement';
