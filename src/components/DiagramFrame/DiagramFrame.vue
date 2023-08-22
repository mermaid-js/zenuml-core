<template>
  <div ref="export" class="zenuml p-1 bg-skin-canvas" style="display: inline-block" :class="theme">
    <!-- We have enabled important: ".zenuml" for tailwind.
          1. Don't use inline-block as class name here. Other clients may not have .zenuml at ancestor level.
          2. .zenuml is used to make sure tailwind css takes effect.
     -->
    <!-- pb-8 is to offset pt-8 in SeqDiagram component
        .whitespace-nowrap will be inherited by all children
     -->
    <debug />
    <div
      class="frame text-skin-frame bg-skin-frame border-skin-frame relative m-1 origin-top-left whitespace-nowrap border rounded"
    >
      <div ref="content">
        <div
          class="header text-skin-title bg-skin-title border-skin-frame border-b p-1 flex justify-between rounded-t"
        >
          <div class="left hide-export">
            <slot></slot>
          </div>
          <div class="right flex-grow flex justify-between">
            <diagram-title :context="title" />
            <!-- Knowledge: how to vertically align a svg icon. -->
            <privacy class="hide-export flex items-center" />
          </div>
        </div>
        <div>
          <div
            v-if="showTips"
            class="fixed z-40 inset-0 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <TipsDialog />
          </div>
        </div>
        <seq-diagram ref="diagram" :style="{ transform: `scale(${scale})`}" class="origin-top-left"/>
      </div>
      <div class="footer text-skin-control px-4 py-1 flex justify-between">
        <div class="flex items-center gap-3 color-base">
          <button class="bottom-1 left-1 hide-export" @click="showTipsDialog()">
            <svg class="filter grayscale w-4 h-4" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z m0-938.666667C276.352 85.333333 85.333333 276.352 85.333333 512s191.018667 426.666667 426.666667 426.666667 426.666667-191.018667 426.666667-426.666667A426.666667 426.666667 0 0 0 512 85.333333z m0 682.666667a42.666667 42.666667 0 0 1-42.368-42.666667v-255.573333a42.368 42.368 0 1 1 84.693333 0V725.333333A42.410667 42.410667 0 0 1 512 768z m0-426.666667a42.325333 42.325333 0 1 1-0.085333-84.650666A42.325333 42.325333 0 0 1 512 341.333333z m42.325333-42.666666v0z"
                fill="currentColor"></path>
            </svg>
          </button>
          <ThemeSelect />
          <div class="flex items-center">
            <input type="checkbox" id="order-display" class="mr-1" :checked="numbering"
                   @input="toggleNumbering(!numbering)">
            <label for="order-display" title="Numbering the diagram" class="select-none">Numbering</label>
          </div>
        </div>
        <div
          class="zoom-controls bg-skin-base flex justify-between w-28 hide-export"
        >
          <button class="zoom-in px-1" @click="zoomIn()">
            <svg class="w-4 h-4" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M945.066667 898.133333l-189.866667-189.866666c55.466667-64 87.466667-149.333333 87.466667-241.066667 0-204.8-168.533333-373.333333-373.333334-373.333333S96 264.533333 96 469.333333 264.533333 842.666667 469.333333 842.666667c91.733333 0 174.933333-34.133333 241.066667-87.466667l189.866667 189.866667c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c8.533333-12.8 8.533333-34.133333-2.133333-46.933334zM469.333333 778.666667C298.666667 778.666667 160 640 160 469.333333S298.666667 160 469.333333 160 778.666667 298.666667 778.666667 469.333333 640 778.666667 469.333333 778.666667z"
                fill="currentColor"></path>
              <path
                d="M597.333333 437.333333h-96V341.333333c0-17.066667-14.933333-32-32-32s-32 14.933333-32 32v96H341.333333c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h96V597.333333c0 17.066667 14.933333 32 32 32s32-14.933333 32-32v-96H597.333333c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32z"
                fill="currentColor"></path>
            </svg>
          </button>
          <label>{{ Number(scale * 100).toFixed(0) }} %</label>
          <button class="zoom-out px-1" @click="zoomOut()">
            <svg class="w-4 h-4" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path d="M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"
                    fill="currentColor"></path>
              <path fill="currentColor"
                    d="M921 867L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z"></path>
            </svg>
          </button>
        </div>
        <width-provider />
        <a
          target="_blank"
          href="https://zenuml.com"
          class="brand absolute bottom-1 right-4 text-xs hover:underline"
        >ZenUML.com</a
        >
      </div>
    </div>
  </div>
</template>

<script>
import {mapState, mapGetters, mapMutations} from 'vuex';
import Privacy from './Privacy/Privacy.vue';
import DiagramTitle from './DiagramTitle/DiagramTitle.vue';
import SeqDiagram from './SeqDiagram/SeqDiagram.vue';
import TipsDialog from './Tutorial/TipsDialog.vue';
import WidthProvider from './Positioning/WidthProvider.vue';
import * as htmlToImage from 'html-to-image';
import Debug from './Debug/Debug.vue';
import ThemeSelect from './ThemeSelect.vue';

export default {
  name: 'DiagramFrame',
  computed: {
    ...mapState(['showTips', 'scale', 'theme', 'numbering']),
    ...mapGetters(['rootContext']),
    title() {
      if (!this.rootContext) {
        console.error('`rootContext` is empty. Please make sure `store` is properly configured.');
      }
      return this.rootContext?.title();
    },
  },
  mounted () {
    // https://stackoverflow.com/a/64429013/529187
    // Expose component instance so we can access toPng and other methods.
    this.$el.__vue__ = this;
  },
  methods: {
    ...mapMutations(['setScale', 'toggleNumbering']),
    showTipsDialog() {
      this.$store.state.showTips = true;

      try {
        this.$gtag?.event('view', {
          event_category: 'help',
          event_label: 'tips dialog',
        });
      } catch (e) {
        console.error(e);
      }
    },
    toPng() {
      return htmlToImage.toPng(this.$refs['export'], {
        backgroundColor: 'white',
        filter: (node) => {
          return !node?.classList?.contains('hide-export');
        },
      });
    },
    toSvg() {
      return htmlToImage.toSvg(this.$refs['export'], {
        backgroundColor: 'white',
        filter: (node) => {
          return !node?.classList?.contains('hide-export');
        },
      });
    },
    toBlob() {
      return htmlToImage.toBlob(this.$refs['export'], {
        backgroundColor: 'white',
        filter: (node) => {
          return !node?.classList?.contains('hide-export');
        },
      });
    },
    toJpeg() {
      // It does not render the 'User' svg icon.
      return htmlToImage.toJpeg(this.$refs['export'], {
        backgroundColor: 'white',
        filter: (node) => {
          return !node?.classList?.contains('hide-export');
        },
      });
    },
    zoomIn() {
      const newScale = Math.min(1, this.scale + 0.1);
      this.setScale(newScale);
    },
    zoomOut() {
      this.setScale(this.scale - 0.1);
    },
    setTheme(theme) {
      this.theme = theme;
    },
    setStyle(style) {
      const styleElementId = 'zenuml-style';
      // check if style element exists
      let styleElement = document.getElementById(styleElementId);
      if (!styleElement) {
        // create a style element and inject the content as textContent
        styleElement = document.createElement('style');
        // give the element a unique id
        styleElement.id = styleElementId;
        document.head.append(styleElement);
      }
      styleElement.textContent = style;
    },
    setRemoteCss(url) {
      const hostname = new URL(url).hostname;

      // if url is from github, we fetch the raw content and set the style
      // if url contains github.com or githubusercontent.com, we fetch the raw content and set the style
      if (hostname === 'https://github.com' || hostname === 'https://githubusercontent.com') {
        fetch(url.replace('github.com', 'raw.githubusercontent.com').replace('blob/', ''))
          .then((response) => response.text())
          .then((text) => {
            this.setStyle(text);
          });
        return;
      }
      const remoteCssUrlId = 'zenuml-remote-css';
      // check if remote css element exists
      let remoteCssElement = document.getElementById(remoteCssUrlId);
      if (!remoteCssElement) {
        // create a style element and inject the content as textContent
        remoteCssElement = document.createElement('link');
        // give the element a unique id
        remoteCssElement.id = remoteCssUrlId;
        remoteCssElement.rel = 'stylesheet';
        document.head.append(remoteCssElement);
      }
      remoteCssElement.href = url;
    },
  },
  components: {
    Debug,
    WidthProvider,
    TipsDialog,
    DiagramTitle,
    SeqDiagram,
    Privacy,
    ThemeSelect,
  },
};
</script>
