import Vue from "vue";
import { mapGetters } from "vuex";

export const DirectionMixin = Vue.extend({
  computed: {
    ...mapGetters(["distance2"]),
    rightToLeft(): boolean {
      return this.distance2(this.source, this.target) < 0;
    },
  },
});
