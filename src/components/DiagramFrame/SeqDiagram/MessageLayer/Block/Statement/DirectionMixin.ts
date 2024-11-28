import { defineComponent } from "vue";
import { mapGetters } from "vuex";

export const DirectionMixin = defineComponent({
  computed: {
    ...mapGetters(["distance2"]),
    rightToLeft(): boolean {
      return this.distance2(this.source, this.target) < 0;
    },
  },
});
