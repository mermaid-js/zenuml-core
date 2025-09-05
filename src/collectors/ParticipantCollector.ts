import { BaseCollector } from './BaseCollector';
import { Participants } from '@/parser/Participants';
import {
  SequenceASTNode,
  ParticipantNode,
  MessageNode,
  CreationNode,
  FragmentNode,
  RetNode,
  GroupNode,
  ToNode,
  FromNode
} from '@/parser/types/astNode.types';

export class ParticipantCollector extends BaseCollector<Participants> {
  private participants = new Participants();
  private groupId?: string;

  registerNodeHandlers(): void {
    this.nodeHandlers.set('ParticipantNode', node => this.ParticipantNode(node as ParticipantNode));
    this.nodeHandlers.set('MessageNode', node => this.MessageNode(node as MessageNode));
    this.nodeHandlers.set('CreationNode', node => this.CreationNode(node as CreationNode));
    this.nodeHandlers.set('FragmentNode', node => this.GroupNode(node as FragmentNode));
    this.nodeHandlers.set('RetNode', node => this.RetNode(node as RetNode));
    this.nodeHandlers.set('ParametersNode', node => this.ParametersNode(node));
    this.nodeHandlers.set('ConditionNode', node => this.ConditionNode(node));
    // Both FromNode and ToNode use the same logic
    this.nodeHandlers.set("FromNode", node => this.FromOrToNode(node as FromNode));
    this.nodeHandlers.set("ToNode", node => this.FromOrToNode(node as ToNode));
  }

  FromOrToNode(node: ToNode): void {
    if (this.shouldSkip) return;
    let participant = node.getText();
    const participantInstance = this.participants.Get(participant);

    // Skip adding participant position if label is present
    if (participantInstance?.label) {
      this.participants.Add(participant, { isStarter: false });
    } else if (participantInstance?.assignee) {
      // If the participant has an assignee, calculate the position of the ctor and store it only.
      // Let's say the participant name is `"${assignee}:${type}"`, we need to get the position of ${type}
      // e.g. ret = new A() "ret:A".method()
      const range = node.getRange();
      const start = range[0] + participantInstance.assignee.length + 2;
      const position: [number, number] = [start, range[1]];
      const assigneePosition: [number, number] = [
        range[0] + 1,
        range[0] + participantInstance.assignee.length + 1,
      ];
      this.participants.Add(participant, {
        isStarter: false,
        position: position,
        assigneePosition: assigneePosition,
      });
    } else {
      this.participants.Add(participant, {
        isStarter: false,
        position: node.getRange(),
      });
    }
  }

  ParticipantNode(node: ParticipantNode): void {
    if (this.shouldSkip) return;

    this.participants.Add(node.getName(), {
      isStarter: node.isStarter(),
      type: node.getType(),
      stereotype: node.getStereotype(),
      width: node.getWidth(),
      groupId: this.groupId || node.getGroupId(),
      label: node.getLabel(),
      explicit: node.isExplicit(),
      color: node.getColor(),
      comment: node.getComment(),
      position: node.getRange(),
    });
  }

  MessageNode(node: MessageNode): void {
    if (this.shouldSkip) return;

    const from = node.getFrom();
    const to = node.getTo();

    if (from) {
      this.participants.Add(from, {
        isStarter: false,
        position: node.getRange(),
      });
    }

    if (to) {
      const participantInstance = this.participants.Get(to);
      if (participantInstance?.label) {
        this.participants.Add(to, { isStarter: false });
      } else if (participantInstance?.assignee) {
        // Handle assignee position calculation similar to ToCollector
        const range = node.getRange();
        if (range) {
          const start = range[0] + participantInstance.assignee.length + 2;
          const position: [number, number] = [start, range[1]];
          const assigneePosition: [number, number] = [
            range[0] + 1,
            range[0] + participantInstance.assignee.length + 1,
          ];
          this.participants.Add(to, {
            isStarter: false,
            position: position,
            assigneePosition: assigneePosition,
          });
        }
      } else {
        this.participants.Add(to, {
          isStarter: false,
          position: node.getRange(),
        });
      }
    }
  }

  CreationNode(node: CreationNode): void {
    if (this.shouldSkip) return;

    const owner = node.getOwner();
    const assignee = node.getAssignee();
    const assigneePosition = node.getAssigneePosition();

    const participantInstance = this.participants.Get(owner);

    if (!participantInstance?.label) {
      this.participants.Add(owner, {
        isStarter: false,
        position: node.getRange(),
        assignee,
        assigneePosition,
      });
    } else {
      this.participants.Add(owner, {
        isStarter: false,
      });
    }
  }

  GroupNode(node: GroupNode): void {
    this.groupId = node.getText();
  }

  RetNode(node: RetNode): void {
    if (node.getAsyncMessage()) {
      return;
    }

    const returnFrom = node.getFrom();
    const returnTo = node.getTo();

    if (returnFrom) {
      this.participants.Add(returnFrom, {
        isStarter: false,
        position: node.getRange(),
      });
    }

    if (returnTo) {
      this.participants.Add(returnTo, {
        isStarter: false,
        position: node.getRange(),
      });
    }
  }

  ParametersNode(_: SequenceASTNode): void {
    this.shouldSkip = true;
  }

  ConditionNode(_: SequenceASTNode): void {
    this.shouldSkip = true;
  }

  postVisitNode(node: SequenceASTNode): void {
    super.postVisitNode(node);

    const nodeType = node.getType();

    // Handle group exit
    if (nodeType === 'GroupNode') {
      this.groupId = undefined;
    }

    // Exit blind mode
    if (nodeType === 'ParametersNode' || nodeType === 'ConditionNode') {
      this.shouldSkip = false;
    }
  }

  traverseNode?(node: SequenceASTNode): void {
    // Default traversal implementation if needed
  }

  reset(): void {
    this.participants = new Participants();
    this.groupId = undefined;
    this.shouldSkip = false;
    this.shouldSkip = false;
  }

  result(): Participants {
    return this.participants;
  }
}
