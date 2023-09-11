import parentLogger from './logger/logger';
import { createApp } from 'vue';
import { createStore } from 'vuex';
import Store from './store/Store';
import DiagramFrame from './components/DiagramFrame/DiagramFrame.vue';
import SeqDiagram from './components/DiagramFrame/SeqDiagram/SeqDiagram.vue';

import './assets/tailwind.css';
import './assets/tailwind-preflight.less';
import './components/Cosmetic.scss';
import './components/Cosmetic-blue.scss';
import './components/Cosmetic-black-white.scss';
import './components/Cosmetic-star-uml.scss';
import './components/theme-blue-river.scss';
import './themes/theme-dark.css';

import Block from './components/DiagramFrame/SeqDiagram/MessageLayer/Block/Block.vue';
import Comment from './components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Comment/Comment.vue';
const logger = parentLogger.child({ name: 'core' });

interface Config {
  theme?: string;
  stickyOffset?: number;
}
interface IZenUml {
  get code(): string | undefined;
  get theme(): string | undefined;
  // Resolve after rendering is finished.
  // eslint-disable-next-line no-unused-vars
  render(code: string | undefined, config: Config | undefined): Promise<IZenUml>;
}

export default class ZenUml implements IZenUml {
  private readonly el: Element;
  private _code: string | undefined;
  private _theme: string | undefined;
  private readonly store: any;
  private readonly app: any;
  private currentTimeout: any;
  constructor(el: Element, naked: boolean = false) {
    this.el = el;
    this.store = createStore(Store());
    this.app = createApp(naked ? SeqDiagram : DiagramFrame);
    this.app.component('Comment', Comment);
    this.app.component('Block', Block);
    this.app.use(this.store);
    this.app.mount(this.el);
    this.addPortalRootElement();
  }

  // DON'T REMOVE: headlessui portal root hack
  // ref: https://github.com/tailwindlabs/headlessui/discussions/666#discussioncomment-4966117
  private addPortalRootElement(): void {
    const portalRootElement = document.createElement('div');
    portalRootElement.id = 'headlessui-portal-root';
    portalRootElement.className = 'zenuml';
    portalRootElement.append(document.createElement('div'));
    document.body.append(portalRootElement);
  }

  async render(code: string | undefined, config: Config | undefined): Promise<IZenUml> {
    logger.debug('rendering', code, config);
    if (this.currentTimeout) {
      console.log('rendering clearTimeout');
      clearTimeout(this.currentTimeout);
    }
    
    this._code = code || this._code;
    this._theme = config?.theme || this._theme;
    this.store.state.stickyOffset = config?.stickyOffset || 0;
    // @ts-ignore
    this.store.state.theme = this._theme || 'default';
    let that=this;
    return new Promise(async (resolve) => {
      that.currentTimeout = setTimeout(async () => {
          console.log('start rendering');
          // await dispatch will wait until the diagram is finished rendering.
          // It includes the time adjusting the top of participants for creation message.
          // $nextTick is different from setTimeout. The latter will be executed after dispatch has returned.
          // @ts-ignore
          await that.store.dispatch('updateCode', { code: that._code });
          //await that.store.dispatch('updateCode', { code: that._code,rootContext:rootContext });
          resolve(that);
      }, that.calculateDebounceMilliseconds(that._code));
    });
  }

  calculateDebounceMilliseconds(code:string | undefined): number  {
    if(!code) return 0;
    let length = code.split('\n').length; 
    if (length < 50) return 200;
    return 500; 
  }

  get code(): string | undefined {
    return this._code;
  }

  get theme(): string | undefined {
    return this._theme;
  }

  async getPng(): Promise<string> {
    // @ts-ignore
    return this.el.children[0].__vue__.toPng();
  }
}

export const VueSequence = {
  createApp,
  createStore,
  Store,
  SeqDiagram,
  DiagramFrame,
};
