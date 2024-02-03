import { onMounted, onUnmounted, ref, Ref } from "vue";

const useClickOutside = (elementRef: Ref) => {
  const isClickOutside = ref(false);

  const handler = (e: Event) => {
    if (elementRef.value) {
      if (elementRef.value.contains(e.target)) {
        isClickOutside.value = false;
      } else {
        isClickOutside.value = true;
      }
    }
  };

  onMounted(() => {
    document.addEventListener("click", handler);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handler);
  });

  return isClickOutside;
};

export default useClickOutside;
