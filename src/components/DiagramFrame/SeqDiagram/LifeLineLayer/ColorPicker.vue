<template>
  <div class="relative inline-block">
    <button
      @click.stop="togglePicker"
      class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:ring-2 hover:ring-blue-200 transition-all"
      :style="{ backgroundColor: modelValue }"
    >
      <svg
        v-if="!modelValue"
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <div
      v-if="isOpen"
      v-click-outside="closePicker"
      class="absolute z-50 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 w-40"
    >
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="color in colors"
          :key="color"
          @click.stop="selectColor(color)"
          class="w-8 h-8 rounded hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
          :style="{ backgroundColor: color }"
          :title="color"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import vClickOutside from "click-outside-vue3";

export default {
  name: "ColorPicker",
  directives: {
    clickOutside: vClickOutside.directive,
  },
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue", "input"],
  setup(props, { emit }) {
    const isOpen = ref(false);
    const colors = [
      "#006837",
      "#00A651",
      "#BFB41B",
      "#FFC20E",
      "#F15A24",
      "#FBB3B1",
      "#F26D7D",
      "#B71F3A",
      "#E31C79",
      "#FF66C4",
      "#FFA3E1",
      "#9E4F9E",
      "#662D91",
      "#4B0082",
      "#2E3192",
      "#0071BC",
      "#1B75BC",
      "#29ABE2",
      "#00BFB3",
      "#4DC7EC",
      "#A7C6ED",
      "#B3B3B3",
      "#666666",
      "#000000",
      "#8B4513",
      "#FF69B4",
      "#DEB887",
      "#B0E0E6",
      "#CD853F",
      "#0000FF",
      "#004B49",
      "#E6E6FA",
      "#D8BFD8",
      "#4A2F24",
    ];

    const togglePicker = () => {
      isOpen.value = !isOpen.value;
    };

    const closePicker = () => {
      isOpen.value = false;
    };

    const selectColor = (color) => {
      console.log("Selected color:", color);
      emit("update:modelValue", color);
      emit("input", color);
      closePicker();
    };

    return {
      isOpen,
      colors,
      togglePicker,
      closePicker,
      selectColor,
    };
  },
};
</script>

<style scoped></style>
