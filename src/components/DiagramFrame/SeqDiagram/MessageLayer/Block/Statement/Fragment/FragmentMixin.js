import { Depth, Participants } from '@/parser';
import { mapGetters } from 'vuex';
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import {Coordinates} from "@/positioning/Coordinates";
import WidthProviderOnBrowser from "@/positioning/WidthProviderFunc";

export const FRAGMENT_LEFT_BASE_OFFSET = 30;
export const FRAGMENT_RIGHT_BASE_OFFSET = 30;

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
      const allParticipants = this.coordinates.participantModels.map((p) => p.name);
      let frameBuilder = new FrameBuilder(allParticipants);
      const frame = frameBuilder.getFrame(this.context);
      const border = FrameBorder(frame);
      return this.distance2(this.leftParticipant, this.from) + border.left + Coordinates.half(WidthProviderOnBrowser, this.leftParticipant);
    },
    fragmentStyle: function () {
      const allParticipants = this.coordinates.participantModels.map((p) => p.name);
      let frameBuilder = new FrameBuilder(allParticipants);
      const frame = frameBuilder.getFrame(this.context);
      const border = FrameBorder(frame);
      return {
        // +1px for the border of the fragment
        transform: 'translateX(' + (this.offsetX + 1) * -1 + 'px)',
        width:
          this.distance2(this.leftParticipant, this.rightParticipant) +
          border.left +
          border.right +
            Coordinates.half(WidthProviderOnBrowser, this.leftParticipant) +
            Coordinates.half(WidthProviderOnBrowser, this.rightParticipant) +
          'px',
      };
    },
  },
};
