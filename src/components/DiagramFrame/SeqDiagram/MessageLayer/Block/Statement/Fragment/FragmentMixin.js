import { Participants } from "@/parser";
import { mapGetters } from "vuex";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import CollapseButton from "./CollapseButton.vue";
import { EventBus } from "@/EventBus";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { _STARTER_ } from "@/parser/OrderedParticipants";

export default {
  props: ["origin1"],
  computed: {
    ...mapGetters(["coordinates"]),
    offsetX: function () {
      const allParticipants = this.coordinates.orderedParticipantNames();
      let frameBuilder = new FrameBuilder(allParticipants);
      const frame = frameBuilder.getFrame(this.context);
      const border = FrameBorder(frame);
      const localParticipants = [
        this.context.Origin() || _STARTER_,
        ...Participants(this.context).Names(),
      ];
      const leftParticipant = allParticipants.find((p) =>
        localParticipants.includes(p),
      );
      // TODO: consider using this.getParticipantGap(this.participantModels[0])
      let halfLeftParticipant = this.coordinates.half(leftParticipant);
      console.debug(
        `left participant: ${leftParticipant} ${halfLeftParticipant}`,
      );
      return (
        (this.from
          ? this.coordinates.distance(leftParticipant, this.from)
          : 0) +
        border.left +
        halfLeftParticipant
      );
    },
    fragmentStyle: function () {
      return {
        // +1px for the border of the fragment
        transform: "translateX(" + (this.offsetX + 1) * -1 + "px)",
        width: TotalWidth(this.context, this.coordinates) + "px",
        minWidth: FRAGMENT_MIN_WIDTH + "px",
      };
    },
  },
  data: function () {
    return { collapsed: false };
  },
  methods: {
    toggle() {
      this.collapsed = !this.collapsed;

      //update participant top in two cases: 1) has child creation statement 2) has sibling creation statement
      //e.g. 1): if(a) { new B }
      //     2): if(a) { while(b) { A.foo }; new B }
      EventBus.emit("participant_set_top");
    },
  },
  components: { CollapseButton },
  watch: {
    context() {
      if (this.collapsed) {
        this.collapsed = false;
      }
    },
  },
};
