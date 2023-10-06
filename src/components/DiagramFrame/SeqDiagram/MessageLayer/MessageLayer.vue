<!-- pr-24 to give space for the right most participant.
TODO: we may need to consider the width of self message on right most participant. -->
<template>
  <div class="message-layer relative z-30 pt-24 pb-10">
    <block :context="context" :style="{ 'padding-left': paddingLeft + 'px' }" />
    <FloatVirtual @initial="onInitial" placement="top" :offset="5" shift :flip="{ padding: flipOffset }" zIndex="30">
      <div class="flex bg-white shadow-md z-10 rounded-md p-1">
        <div v-for="btn of btns" @click="() => onClick(btn.class)" :key="btn.name">
          <div :class="btn.class"
            class="w-6 mx-1 py-1 rounded-md text-black text-center cursor-pointer hover:bg-gray-200">
            {{ btn.content }}
          </div>
        </div>
      </div>
    </FloatVirtual>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue';
import { useStore } from 'vuex';
import { FloatVirtual, FloatVirtualInitialProps, useOutsideClick } from '@headlessui-float/vue'
import parentLogger from '../../../../logger/logger';
import { getLineHead, getPrevLine, getPrevLineHead } from '@/utils/String';
import { PARTICIPANT_HEIGHT } from '@/positioning/Constants';
import { getElementDistanceToTop } from '@/utils/dom';

const logger = parentLogger.child({ name: 'MessageLayer' });

defineProps<{
  context: any;
}>()
const store = useStore()
const participants = computed(() => store.getters.participants)
const centerOf = computed(() => store.getters.centerOf)
const code = computed(() => store.getters.code)
const onUpdateEditorContent = computed(() => store.getters.onUpdateEditorContent ||( () => {}))
const flipOffset = computed(() => getElementDistanceToTop(store.getters.diagramElement) + PARTICIPANT_HEIGHT)
const paddingLeft = computed(() => {
  if (participants.value.Array().length >= 1) {
    const first = participants.value.Array().slice(0)[0].name;
    return centerOf.value(first);
  }
  return 0;
})

const messageContext = ref<{ value: any }>({ value: null })
const onInitial = ({ show, reference, floating }: FloatVirtualInitialProps) => {
  store.commit('onMessageClick', (context: any, element: HTMLElement) => {
    reference.value = {
      getBoundingClientRect: () => element.getBoundingClientRect()
    }
    messageContext.value = context
    show.value = true
  })
  useOutsideClick(floating, () => {
    show.value = false
  }, computed(() => show.value))
}

const btns = [
  {
    name: 'bold',
    content: 'B',
    class: 'font-bold'
  },
  {
    name: 'italic',
    content: 'I',
    class: 'italic'
  },
  {
    name: 'underline',
    content: 'U',
    class: 'underline'
  },
  {
    name: 'strikethrough',
    content: 'S',
    class: 'line-through'
  }
]
const onClick = (style: string) => {
  if (!messageContext.value.value) return
  const start = messageContext.value.value.start.start
  const lineHead = getLineHead(code.value, start)
  const prevLine = getPrevLine(code.value, start)
  const leadingSpaces = code.value.slice(lineHead).match(/^\s*/)?.[0] || ''
  const prevLineIsComment = prevLine.trim().startsWith('//')
  if (prevLineIsComment) {
    const trimedPrevLine = prevLine.trimStart().slice(2).trimStart()
    const styleStart = trimedPrevLine.indexOf('[')
    const styleEnd = trimedPrevLine.indexOf(']')
    if (styleStart === 0 && styleEnd) {
      const existedStyles = trimedPrevLine.slice(styleStart + 1, styleEnd)
      if (!existedStyles.split(',').map((s) => s.trim()).includes(style)) {
        onUpdateEditorContent.value(
          code.value.slice(0, getPrevLineHead(code.value, start)) + `${leadingSpaces}// [${existedStyles}, ${style}]\n` + code.value.slice(lineHead)
        )
      }
    }
  } else {
    onUpdateEditorContent.value(
      code.value.slice(0, lineHead) + `${leadingSpaces}// [${style}]\n` + code.value.slice(lineHead)
    )
  }
}

onMounted(() => {
  logger.debug('MessageLayer mounted')
})
onUpdated(() => {
  logger.debug('MessageLayer updated')
})
</script>

<style lang="scss">
.zenuml {

  /* Avoid moving interaction to the left or right with margins.
  We can always assume that an interaction's border is the lifeline.
  Moving content with padding is OK.
  Don't move this to the Interaction component. This is also used by Interaction-async
   */
  .interaction {
    /*Keep dashed or solid here otherwise no space is given to the border*/
    border: dashed transparent 0;
  }

  .interaction.sync {
    /* This border width configuration make sure the content width is
       the same as from the source occurrence's right border to target
       occurrence's left boarder (boarder not inclusive).*/
    border-right-width: 7px;
  }

  .interaction.sync.right-to-left {
    /* This border width configuration make sure the content width is
       the same as from the source occurrence's right border to target
       occurrence's left boarder (boarder not inclusive).*/
    border-right-width: 0;
    border-left-width: 7px;
  }

  .interaction.inited-from-occurrence,
  .interaction.self-invocation {
    border-left-width: 7px;
  }

  .interaction.return {
    border-left-width: 7px;
    border-right-width: 7px;
  }

  .interaction.return-to-start {
    border-left-width: 0;
  }

  .interaction:hover {
    cursor: pointer;
  }

  .message {
    position: relative;
    /* positioning Point */
  }

  .message>.name {
    text-align: center;
  }

  .interaction.right-to-left>.occurrence {
    /* InteractionBorderWidth + (OccurrenceWidth-1)/2 */
    left: -14px;
    /* overlay occurrence bar on the existing bar. */
  }

  .interaction.self>.occurrence {
    /* width of InteractionBorderWidth 7px + lifeline center 1px */
    left: -8px;
    /* overlay occurrence bar on the existing bar. */
    margin-top: -10px;
  }

  .fragment {
    border-width: 1px;
    margin: 8px 0 0 0;
    padding-bottom: 10px;
  }

  .fragment .fragment {
    margin: 16px 0 0 0;
  }
}
</style>
