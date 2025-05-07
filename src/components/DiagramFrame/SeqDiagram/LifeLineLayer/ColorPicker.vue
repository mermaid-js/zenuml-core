<template>
  <div class="inline-block">
    <button
      @click.stop="togglePicker"
      class="w-6 h-6 rounded border border-gray-300 flex items-center justify-center"
      :style="{ backgroundColor: modelValue, color: white }"
    >
      <svg
        v-if="!modelValue"
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 text-gray-500"
        viewBox="-4 -4 24 24"
        fill="currentColor"
        role="presentation"
      >
        <path
          fill="white"
          fill-rule="evenodd"
          d="M5.655.095 13.78 8.22a.75.75 0 0 1 0 1.06l-5.616 5.617a2 2 0 0 1-2.828 0L.604 10.164a2 2 0 0 1 0-2.828L5.689 2.25 4.595 1.155zM6.75 3.31 2.06 8h9.38zm4.69 6.19H2.06l4.336 4.335a.5.5 0 0 0 .708 0z"
          clip-rule="evenodd"
        />
        <path
          fill="white"
          d="M14.5 12a.75.75 0 0 0-.654.383v.002l-.003.003-.007.013-.026.046a16 16 0 0 0-.36.695 8 8 0 0 0-.283.642c-.068.176-.167.457-.167.716a1.5 1.5 0 0 0 3 0c0-.259-.1-.54-.167-.716a8 8 0 0 0-.284-.642 16 16 0 0 0-.36-.695l-.025-.046-.007-.013-.002-.004-.001-.001A.75.75 0 0 0 14.5 12"
        />
      </svg>
    </button>
    <div
      v-if="isOpen"
      v-click-outside="closePicker"
      class="absolute z-50 transform left-1/2 -translate-x-1/2 p-2 bg-white rounded border border-gray-200 w-40"
    >
      <div class="grid grid-cols-4 gap-2">
        <button
          v-for="color in colors"
          :key="color"
          @click.stop="selectColor(color)"
          class="w-8 h-8 rounded"
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
      "#00c875",
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
