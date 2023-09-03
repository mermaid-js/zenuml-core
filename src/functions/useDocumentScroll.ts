import { onMounted, onUnmounted, ref } from "vue";

export default function useDocumentScroll() {
  const scrollTop = ref(0)
  const scrollLeft = ref(0)
  const updateScroll = () => {
    scrollTop.value = document.documentElement.scrollTop
    scrollLeft.value = document.documentElement.scrollLeft
  }
  onMounted(() => {
    updateScroll()
    document.addEventListener('scroll', updateScroll)
  })
  onUnmounted(() => {
    document.removeEventListener('scroll', updateScroll)
  })
  return [scrollTop, scrollLeft]
}
