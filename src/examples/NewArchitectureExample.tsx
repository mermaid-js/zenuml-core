import React from 'react';
import { useAtomValue } from 'jotai';
import { diagramLayoutAtom, domainModelAtom } from '@/domain/DomainModelStore';

/**
 * Example component showing how to use the new architecture
 */
export const NewArchitectureExample = () => {
  const domainModel = useAtomValue(domainModelAtom);
  const diagramLayout = useAtomValue(diagramLayoutAtom);
  
  if (!domainModel || !diagramLayout) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="new-architecture-demo">
      <h2>Domain Model Participants</h2>
      <ul>
        {Array.from(domainModel.participants.values()).map(participant => (
          <li key={participant.id}>
            {participant.name} - {participant.type}
            {participant.color && ` (${participant.color})`}
          </li>
        ))}
      </ul>
      
      <h2>Layout Information</h2>
      <ul>
        {diagramLayout.participants.map(layout => (
          <li key={layout.participantId}>
            {layout.participantId}: x={layout.bounds.x}, width={layout.bounds.width}
          </li>
        ))}
      </ul>
      
      <h2>Dividers</h2>
      <ul>
        {diagramLayout.dividers.map((divider, index) => (
          <li key={index}>
            {divider.text} at y={divider.bounds.y}
          </li>
        ))}
      </ul>
    </div>
  );
};