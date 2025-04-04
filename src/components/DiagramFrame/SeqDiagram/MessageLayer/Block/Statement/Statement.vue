<template>
  <!-- Always reset the text alignment for each statement: https://github.com/ZenUml/core/issues/406
       Set text color to text-skin-base for all messages and allow fragments to override it. -->
  <component
    class="text-left text-sm text-skin-message"
    :origin="origin"
    :class="{ hidden: collapsedCheck }"
    v-bind:is="subStatement"
    :context="context"
    :comment="comment"
    :commentObj="commentObj"
    :number="number"
  ></component>
</template>

<script>
import Creation from "./Creation/Creation.vue";
import Interaction from "./Interaction/Interaction.vue";
import InteractionAsync from "./InteractionAsync/Interaction-async.vue";
import FragmentAlt from "./Fragment/FragmentAlt.vue";
import FragmentPar from "./Fragment/FragmentPar.vue";
import FragmentLoop from "./Fragment/FragmentLoop.vue";
import FragmentOpt from "./Fragment/FragmentOpt.vue";
import FragmentSection from "./Fragment/FragmentSection.vue";
import FragmentCritical from "./Fragment/FragmentCritical.vue";
import FragmentRef from "./Fragment/FragmentRef.vue";
import FragmentTryCatchFinally from "./Fragment/FragmentTryCatchFinally.vue";
import Return from "./Return/Return.vue";
import Divider from "./Divider/Divider.vue";
import Comment from "../../../../../Comment/Comment";

export default {
  name: "statement",
  props: ["origin", "context", "number", "collapsed"],
  computed: {
    comment: function () {
      return this.context.getComment() ? this.context.getComment() : "";
    },
    commentObj: function () {
      return new Comment(this.comment);
    },
    subStatement: function () {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let that = this;
      let dict = {
        loop: "FragmentLoop",
        alt: "FragmentAlt",
        par: "FragmentPar",
        opt: "FragmentOpt",
        section: "FragmentSection",
        critical: "FragmentCritical",
        tcf: "FragmentTryCatchFinally",
        ref: "FragmentRef",
        creation: "Creation",
        message: "Interaction",
        asyncMessage: "InteractionAsync",
        divider: "Divider",
        ret: "Return",
      };
      let key = Object.keys(dict).find((x) => that.context[x]() !== null);
      return dict[key];
    },
    collapsedCheck: function () {
      return this.collapsed && this.subStatement !== "Return";
    },
  },
  components: {
    Creation,
    Interaction,
    InteractionAsync,
    FragmentAlt,
    FragmentPar,
    FragmentOpt,
    FragmentSection,
    FragmentCritical,
    FragmentRef,
    FragmentTryCatchFinally,
    FragmentLoop,
    Divider,
    Return,
  },
};
</script>
