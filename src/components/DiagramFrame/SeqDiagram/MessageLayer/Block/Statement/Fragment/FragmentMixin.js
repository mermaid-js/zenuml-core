import { Participants } from '@/parser';
import { mapGetters } from 'vuex';
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import {Coordinates} from "@/positioning/Coordinates";
import WidthProviderOnBrowser from "@/positioning/WidthProviderFunc";
import {TotalWidth} from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";

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
      const allParticipants = this.coordinates.orderedParticipantNames();
      return allParticipants.find((p) => this.localParticipants.includes(p));
    },
    rightParticipant: function () {
      const allParticipants = this.coordinates.orderedParticipantNames();
      return allParticipants.reverse().find((p) => this.localParticipants.includes(p));
    },
    offsetX: function () {
      const allParticipants = this.coordinates.orderedParticipantNames();
      let frameBuilder = new FrameBuilder(allParticipants);
      const frame = frameBuilder.getFrame(this.context);
      const border = FrameBorder(frame);
      return this.distance2(this.leftParticipant, this.from) + border.left + Coordinates.half(WidthProviderOnBrowser, this.leftParticipant);
    },
    fragmentStyle: function () {
      return {
        // +1px for the border of the fragment
        transform: 'translateX(' + (this.offsetX + 1) * -1 + 'px)',
        width:
          TotalWidth(this.context, this.coordinates) +
          'px',
      };
    },
  },
};
