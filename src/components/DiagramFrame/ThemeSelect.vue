<template>
  <button
    type="button"
    class="flex items-center icon-container"
    @click="openModal"
  >
    <Icon name="theme" />
    <span class="dot" v-if="!themeIconDot"></span>
  </button>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-semibold leading-6 text-gray-900"
              >
                Theme
              </DialogTitle>
              <p class="text-gray-500 text-sm">Customize your UI theme</p>
              <div class="mt-4">
                <div>
                  <RadioGroup
                    :model-value="selected"
                    @update:modelValue="updateTheme"
                  >
                    <RadioGroupLabel class="sr-only"
                      >Server size
                    </RadioGroupLabel>
                    <div class="space-y-2">
                      <RadioGroupOption
                        as="template"
                        v-for="theme in themes"
                        :key="theme.id"
                        :value="theme.id"
                        v-slot="{ checked }"
                      >
                        <div
                          :class="[
                            checked
                              ? 'border-2 text-gray-900 border-primary'
                              : 'border-2 border-transparent',
                          ]"
                          class="relative flex items-center cursor-pointer rounded-lg px-4 py-3 shadow-md"
                        >
                          <div class="flex w-full items-center justify-between">
                            <div
                              class="flex items-center text-sm text-gray-900"
                            >
                              <Icon
                                v-if="checked"
                                name="selected-cycle"
                                icon-class="h-5 w-5 fill-none"
                              />
                              <Icon
                                v-else
                                name="non-selected-cycle"
                                icon-class="h-5 w-5"
                              />
                              <RadioGroupLabel
                                as="p"
                                :class="
                                  checked ? 'text-gray-900' : 'text-gray-900'
                                "
                                class="font-medium ml-2"
                              >
                                {{ theme.name }}
                              </RadioGroupLabel>
                            </div>
                          </div>
                          <span
                            class="inline-block w-20 border rounded-md overflow-hidden"
                            v-html="theme.icon"
                          />
                        </div>
                      </RadioGroupOption>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<style>
.icon-container {
  position: relative;
  display: inline-block;
}

.dot {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: red;
}
</style>

<script setup>
import { computed, ref } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";
import { useStore } from "vuex";
import { trackEvent } from "../../utils/TrackEvent";
// TODO: add Icon component, use inline-svg loader instead
import Icon from "../Icon/Icon.vue";
import ThemeLegacy from "../../assets/theme/theme-legacy.svg?raw";
import ThemeCleanLight from "../../assets/theme/theme-clean-light.svg?raw";
import ThemeCleanDark from "../../assets/theme/theme-clean-dark.svg?raw";
import ThemeNeonDark from "../../assets/theme/theme-neon-dark.svg?raw";

const isOpen = ref(false);

const themes = [
  {
    name: "Legacy",
    id: "theme-default",
    icon: ThemeLegacy,
  },
  {
    name: "Clear Light",
    id: "theme-clean-light",
    icon: ThemeCleanLight,
  },
  {
    name: "Clear Dark",
    id: "theme-clean-dark",
    icon: ThemeCleanDark,
  },
  {
    name: "Neon Dark",
    id: "theme-neon",
    icon: ThemeNeonDark,
  },
];

const store = useStore();
const selected = computed(() => store.state.theme || themes[0].id);
const themeIconDot = ref(store.state.themeIconDot);

const closeModal = () => {
  isOpen.value = false;
  trackEvent(store, selected.value, "theme_close_modal", "theme");
};
const openModal = () => {
  isOpen.value = true;
  themeIconDot.value = true;
  store.commit("setThemeIconDot", true);
  trackEvent(store, selected.value, "theme_open_modal", "theme");
};

const updateTheme = (theme) => {
  selected.value = theme;
  store.commit("setTheme", theme);
  trackEvent(store, selected.value, "theme_selected", "theme");
};
</script>
