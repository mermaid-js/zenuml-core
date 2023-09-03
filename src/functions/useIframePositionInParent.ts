import { onMounted, onUnmounted, onUpdated, ref } from "vue";

const detector = document.createElement('div')
detector.style.position = 'absolute'
detector.style.top = '0'
detector.style.left = '0'
detector.style.opacity = '0'
detector.style.pointerEvents = 'none'
document.body.appendChild(detector)

export default function useIframePositionInParent() {
  const top = ref(0)
  const left = ref(0)
  let scrollHeight = document.documentElement.scrollHeight
  let scrollWidth = document.documentElement.scrollWidth
  const observer = ref<IntersectionObserver>()

  const createObserver = () => {
    const threshold = new Array(scrollHeight).fill(0).map((_, index) => index / scrollHeight)
    observer.value = new IntersectionObserver(([entry]) => {
      top.value = entry.intersectionRect.top
      left.value = entry.intersectionRect.left
    }, {
      threshold
    });
    observer.value.observe(detector);
  }

  onMounted(() => {
    detector.style.height = `${scrollHeight}px`
    detector.style.width = `${scrollWidth}px`
    createObserver()
  })
  onUnmounted(() => {
    observer.value?.disconnect?.()
  })
  return [top, left]
}
