<template>
  <div  class="styling-panel absolute bottom-3 left-[50%] translate-x-[-50%] flex bg-white shadow-md z-10 rounded-md p-1" >
    <div v-for="btn of btns" @click="() => onClick(btn.class)">
      <div :class="btn.class" class="w-6 mx-1 py-1 hover:bg-gray-200 rounded-md">
        {{ btn.content }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';

const getLineHead = (code: string, position: number) => {
  let i = position
  while (i >= 0) {
    if (code[i] === '\n') return i + 1
    i--
  }
  return 0
}
const getPrevLine = (code: string, position: number) => {
  const lineHead = getLineHead(code, position)
  if (lineHead === 0) return ''
  let i = lineHead - 2
  while (i >= 0) {
    if (code[i] === '\n') return code.slice(i + 1, lineHead)
    i--
  }
  return code.slice(0, lineHead)
}

const props = defineProps<{
  context?: any;
}>()
const store = useStore<{code: string}>()
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
  if (!props.context) return
  console.log(1);
  const start = props.context.start.start
  const code = store.state.code
  const lineHead = getLineHead(code, start)
  const prevLine = getPrevLine(code, start)
  const leadingSpaces = code.slice(lineHead).match(/^\s*/)?.[0] || ''
  const prevLineIsComment = prevLine.trim().startsWith('//')
  if (prevLineIsComment) {
    if (prevLine.includes('[') && prevLine.includes(']')) {

    }
  } else {
    editor.setValue(code.slice(0, lineHead) + `${leadingSpaces}// [${style}]\n` + code.slice(lineHead));
  }
}
</script>
