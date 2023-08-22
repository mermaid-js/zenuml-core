<template>
  <button type="button" @click="openModal">
    <svg class="grayscale h-4 w-4" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M42.666667 512C42.666667 251.733333 251.733333 42.666667 512 42.666667s469.333333 187.733333 469.333333 422.4c0 72.533333-29.866667 145.066667-81.066666 200.533333-51.2 51.2-123.733333 81.066667-200.533334 81.066667h-85.333333c-12.8 0-25.6 12.8-29.866667 25.6 0 8.533333 4.266667 17.066667 8.533334 21.333333 21.333333 21.333333 29.866667 46.933333 29.866666 76.8 0 64-51.2 110.933333-115.2 115.2C251.733333 981.333333 42.666667 772.266667 42.666667 512z m85.333333 0c0 213.333333 170.666667 384 384 384 17.066667 0 29.866667-12.8 29.866667-29.866667 0-4.266667 0-8.533333-4.266667-12.8l-4.266667-4.266666c-17.066667-21.333333-25.6-46.933333-29.866666-76.8 0-64 51.2-110.933333 115.2-110.933334h85.333333c51.2 0 102.4-21.333333 136.533333-55.466666 38.4-38.4 55.466667-85.333333 55.466667-136.533334 0-187.733333-170.666667-341.333333-384-341.333333s-384 170.666667-384 384z m593.066667 21.333333c-21.333333-21.333333-25.6-51.2-17.066667-76.8 12.8-25.6 38.4-42.666667 64-42.666666 38.4 0 68.266667 34.133333 72.533333 72.533333 0 29.866667-17.066667 55.466667-42.666666 64-8.533333 4.266667-17.066667 4.266667-25.6 4.266667-17.066667 0-38.4-8.533333-51.2-21.333334z m-520.533334 0c-21.333333-21.333333-25.6-51.2-17.066666-76.8 12.8-25.6 38.4-42.666667 64-42.666666 38.4 0 68.266667 34.133333 72.533333 72.533333 0 29.866667-17.066667 55.466667-42.666667 64-8.533333 4.266667-17.066667 4.266667-25.6 4.266667-21.333333 0-38.4-8.533333-51.2-21.333334z m379.733334-187.733333c-21.333333-21.333333-25.6-51.2-17.066667-76.8 12.8-25.6 38.4-42.666667 64-42.666667 38.4 0 68.266667 34.133333 72.533333 72.533334 0 29.866667-17.066667 55.466667-42.666666 64-8.533333 4.266667-17.066667 4.266667-25.6 4.266666-21.333333 0-38.4-8.533333-51.2-21.333333zM341.333333 345.6c-17.066667-21.333333-25.6-51.2-12.8-76.8 12.8-25.6 38.4-42.666667 64-42.666667 38.4 0 68.266667 34.133333 72.533334 72.533334 0 29.866667-17.066667 55.466667-42.666667 64l-29.866667 4.266666c-17.066667 0-34.133333-8.533333-51.2-21.333333z"></path>
    </svg>
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
        <div class="fixed inset-0 bg-black bg-opacity-25"/>
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
                  <RadioGroup :model-value="selected" @update:modelValue="updateTheme">
                    <RadioGroupLabel class="sr-only">Server size</RadioGroupLabel>
                    <div class="space-y-2">
                      <RadioGroupOption
                        as="template"
                        v-for="theme in themes"
                        :key="theme.id"
                        :value="theme.id"
                        v-slot="{ active, checked }"
                      >
                        <div
                          :class="[checked ? 'border-2 text-gray-900 border-primary' : 'border-2 border-transparent']"
                          class="relative flex items-center cursor-pointer rounded-lg px-4 py-3 shadow-md"
                        >
                          <div class="flex w-full items-center justify-between">
                            <div class="flex items-center text-sm text-gray-900">
                              <svg v-if="checked" class="h-5 w-5" viewBox="0 0 20 20" fill="none">
                                <circle
                                  class="text-base"
                                  cx="10"
                                  cy="10"
                                  r="10"
                                  fill="#4f8cf7"
                                  fill-opacity="0.2"
                                />
                                <path
                                  d="M6 10l3 3 5-5"
                                  stroke="#4f8cf7"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                />
                              </svg>
                              <svg v-else class="h-5 w-5" viewBox="0 0 20 20" fill="none">
                                <circle
                                  cx="10"
                                  cy="10"
                                  r="10"
                                  fill="#000"
                                  fill-opacity="0.1"
                                />
                              </svg>
                              <RadioGroupLabel
                                as="p"
                                :class="checked ? 'text-gray-900' : 'text-gray-900'"
                                class="font-medium ml-2"
                              >
                                {{ theme.name }}
                              </RadioGroupLabel>
                            </div>
                          </div>
                          <span class="inline-block w-20 border rounded-md overflow-hidden" v-html="theme.icon"/>
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

<script setup>
import {ref} from 'vue'
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupOption,
} from '@headlessui/vue'
import {useStore} from 'vuex';
// TODO: add Icon component, use inline-svg loader instead
import ThemeLegacy from '../../assets/theme/theme-legacy.svg?raw';
import ThemeCleanLight from '../../assets/theme/theme-clean-light.svg?raw';
import ThemeCleanDark from '../../assets/theme/theme-clean-dark.svg?raw';

const isOpen = ref(false)

const themes = [
  {
    name: 'Legacy',
    id: 'theme-default',
    icon: ThemeLegacy
  },
  {
    name: 'Clean Light',
    id: 'theme-clean-light',
    icon: ThemeCleanLight
  },
  {
    name: 'Clean Dark',
    id: 'theme-clean-dark',
    icon: ThemeCleanDark
  },
]

const selected = ref(themes[0].id)
const store = useStore()

const closeModal = () => {
  isOpen.value = false
}
const openModal = () => {
  isOpen.value = true
}

const updateTheme = (theme) => {
  selected.value = theme
  store.commit('setTheme', theme)
}

</script>
