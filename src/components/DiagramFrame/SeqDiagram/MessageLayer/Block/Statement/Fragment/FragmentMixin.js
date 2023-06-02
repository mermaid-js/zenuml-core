import { Depth, Participants } from '../../../../../../../parser';
import { mapGetters } from 'vuex';
import { AllMessages } from '../../../../../../../positioning/MessageContextListener';
import WidthProviderOnBrowser from '../../../../../../../positioning/WidthProviderFunc';
import {TextType} from "../../../../../../../positioning/Coordinate";

export const FRAGMENT_LEFT_BASE_OFFSET = 30;
export const FRAGMENT_RIGHT_BASE_OFFSET = 50;

export default {
  computed: {
    ...mapGetters(['coordinates', 'distance2']),
    localParticipants: function () {
      // [A, B, C, D] the order may not be the same as appeared on the Lifeline layer
      return [
        this.from,
        ...Participants(this.context)
          .ImplicitArray()
          .map((p) => p.name),
      ];
    },
    leftParticipant: function () {
      const allParticipants = this.coordinates.participantModels.map((p) => p.name);
      return allParticipants.find((p) => this.localParticipants.includes(p));
    },
    rightParticipant: function () {
      const allParticipants = this.coordinates.participantModels.map((p) => p.name);
      return allParticipants.reverse().find((p) => this.localParticipants.includes(p));
    },
    depth: function () {
      return Depth(this.context);
    },
    offsetX: function () {
      let extra = 10 * (this.depth + 1);
      return this.distance2(this.leftParticipant, this.from) + extra + FRAGMENT_LEFT_BASE_OFFSET;
    },
    fragmentStyle: function () {
      const allMessages = AllMessages(this.context);
      // the messages have a structure like {from, signature, type, to}
      // find all the messages that has from == to == rightParticipant
      const widths = allMessages
          .filter((m) => m.from === m.to && m.from === this.rightParticipant)
          .map((m) => m.signature)
          .map((s) => WidthProviderOnBrowser(s, TextType.MessageContent));
      let width = Math.max.apply(null, [0, ...widths])
      return {
        // +1px for the border of the fragment
        transform: 'translateX(' + (this.offsetX + 1) * -1 + 'px)',
        width:
          this.distance2(this.leftParticipant, this.rightParticipant) +
          20 * this.depth +
          FRAGMENT_LEFT_BASE_OFFSET +
          FRAGMENT_RIGHT_BASE_OFFSET +
          width +
          'px',
      };
    },
  },
};
