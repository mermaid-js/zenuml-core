import { Participants } from '@/parser';
import { mapGetters } from 'vuex';
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import {Coordinates} from "@/positioning/Coordinates";
import WidthProviderOnBrowser from "@/positioning/WidthProviderFunc";
import {TotalWidth} from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";

export default {
  computed: {
    ...mapGetters(['coordinates']),
    offsetX: function () {
      const allParticipants = this.coordinates.orderedParticipantNames();
      let frameBuilder = new FrameBuilder(allParticipants);
      const frame = frameBuilder.getFrame(this.context);
      const border = FrameBorder(frame);
      const localParticipants = [this.context.Origin(), ...Participants(this.context).Names()]
      const leftParticipant = allParticipants.find((p) => localParticipants.includes(p));
      // TODO: consider using this.getParticipantGap(this.participantModels[0])
      let halfLeftParticipant = Coordinates.half(WidthProviderOnBrowser, leftParticipant);
      console.debug(`left participant: ${leftParticipant} ${halfLeftParticipant}`);
      return this.coordinates.distance(leftParticipant, this.from) + border.left + halfLeftParticipant;
    },
    fragmentStyle: function () {
      return {
        // +1px for the border of the fragment
        transform: 'translateX(' + (this.offsetX + 1) * -1 + 'px)',
        width: TotalWidth(this.context, this.coordinates) + 'px',
      };
    },
  },
};
