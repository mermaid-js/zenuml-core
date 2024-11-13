<template>
  <div
    class="divider"
    :data-origin="origin1"
    :style="{
      width: width + 'px',
      transform: 'translateX(' + (-1 * centerOfOrigin + 10) + 'px)',
    }"
  >
    <div class="left bg-skin-divider"></div>
    <div
      class="name"
      :style="messageStyle.style.textStyle"
      :class="messageStyle.style.classNames"
    >
      {{ messageStyle.note }}
    </div>
    <div class="right bg-skin-divider"></div>
  </div>
</template>

<script>
import { getStyle } from "@/utils/messageStyling";
import { mapGetters } from "vuex";

export default {
  name: "divider",
  props: ["context", "origin1"],
  computed: {
    ...mapGetters(["participants", "centerOf"]),
    /* Dividers have the same width as the lifeline layer */
    width() {
      // TODO: with should be the width of the whole diagram
      let rearParticipant = this.participants.Names().pop();
      // 20px for the right margin of the participant
      return this.centerOf(rearParticipant) + 10;
    },
    centerOfOrigin() {
      return this.centerOf(this.origin1);
    },
    note: function () {
      return this.context.divider().Note();
    },
    messageStyle() {
      if (
        this.note.trim().indexOf("[") === 0 &&
        this.note.indexOf("]") !== -1
      ) {
        const startIndex = this.note.indexOf("[");
        const endIndex = this.note.indexOf("]");
        const [style, note] = [
          this.note.slice(startIndex + 1, endIndex),
          this.note.slice(endIndex + 1),
        ];
        return { style: getStyle(style.split(",").map((s) => s.trim())), note };
      }
      return { style: getStyle([]), note: this.note };
    },
  },
};
</script>

<style scoped>
.divider {
  display: flex;
  align-items: center;
}

.name {
  margin: 0;
  padding: 2px 6px 2px 6px;
}

.left,
.right {
  height: 1px;
  flex-grow: 1;
}
</style>
