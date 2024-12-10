import { inject, onMounted } from "vue";
import { RegisterMountKey, UnregisterMountKey } from "./types";
import { onBeforeMount } from "vue";

export function useNodeRegistration(nodeId: string) {
  const registerMount = inject(RegisterMountKey, () => {
    throw new Error("RegisterMountKey not found");
  });

  const unregisterMount = inject(UnregisterMountKey, () => {
    throw new Error("UnregisterMountKey not found");
  });

  onBeforeMount(() => {
    registerMount?.(nodeId);
  });

  onMounted(() => {
    unregisterMount?.(nodeId);
  });
}
