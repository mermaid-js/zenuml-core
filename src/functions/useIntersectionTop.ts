import { onMounted, onUnmounted, ref } from "vue";

const DETECTOR_COUNT = 10;
const INTERSECTION_ERROR_MARGIN = 1

const detectorContainer = document.createElement("div");
Object.assign(detectorContainer.style, {
  position: "absolute",
  top: "0",
  left: "0",
  opacity: "0",
  pointerEvents: "none"
});
const detectors = new Array(DETECTOR_COUNT).fill(0).map(() => {
  const detector = document.createElement("div");
  Object.assign(detector.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%"
  });
  detectorContainer.appendChild(detector);
  return detector;
});
document.body.appendChild(detectorContainer);

export default function useIntersectionTop() {
  const top = ref(0);
  let observer: IntersectionObserver;

  onMounted(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollWidth = document.documentElement.scrollWidth;
    detectorContainer.style.height = scrollHeight + "px";
    detectorContainer.style.width = scrollWidth + "px";
    const detectorHeight = Math.ceil(
      document.documentElement.scrollHeight / DETECTOR_COUNT
    );
    const threshold = [...Array(detectorHeight + 1).keys()].map(
      i => i / detectorHeight
    );
    detectors.forEach((detector, index) => {
      detector.style.top = index * detectorHeight + "px";
      detector.style.height = detectorHeight + "px";
    });
    observer = new IntersectionObserver(
      ([entry]) => {
        const isTopIntersection =
          entry.intersectionRect.top - entry.boundingClientRect.top > INTERSECTION_ERROR_MARGIN || entry.target === detectors[0];
          if (isTopIntersection) {
            top.value = entry.intersectionRect.top;
          }
      },
      {
        threshold
      }
    );
    detectors.forEach(detector => {
      observer.observe(detector);
    });
  });
  onUnmounted(() => {
    observer.disconnect();
  });
  return top;
}
