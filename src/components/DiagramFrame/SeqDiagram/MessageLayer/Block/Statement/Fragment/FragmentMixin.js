import { mapGetters } from "vuex";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import CollapseButton from "./CollapseButton.vue";
import { EventBus } from "@/EventBus";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";

export default {
  props: ["origin"],
  computed: {
    ...mapGetters(["coordinates"]),
    leftParticipant: function () {
      const allParticipants = this.coordinates.orderedParticipantNames();
      const localParticipants = getLocalParticipantNames(this.context);
      return allParticipants.find((p) => localParticipants.includes(p));
    },
    border: function () {
      const allParticipants = this.coordinates.orderedParticipantNames();
      let frameBuilder = new FrameBuilder(allParticipants);
      const frame = frameBuilder.getFrame(this.context);
      return FrameBorder(frame);
    },
    offsetX: function () {
      // TODO: consider using this.getParticipantGap(this.participantModels[0])
      let halfLeftParticipant = this.coordinates.half(this.leftParticipant);
      console.debug(
        `left participant: ${this.leftParticipant} ${halfLeftParticipant}`,
      );
      return (
        (this.origin
          ? this.coordinates.distance(this.leftParticipant, this.origin)
          : 0) +
        this.border.left +
        halfLeftParticipant
      );
    },
    paddingLeft: function () {
      let halfLeftParticipant = this.coordinates.half(this.leftParticipant);
      return this.border.left + halfLeftParticipant;
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
