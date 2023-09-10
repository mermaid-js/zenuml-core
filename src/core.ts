import parentLogger from './logger/logger';
import { createApp } from 'vue';
import { createStore } from 'vuex';
import Store from './store/Store';
import DiagramFrame from './components/DiagramFrame/DiagramFrame.vue';
import SeqDiagram from './components/DiagramFrame/SeqDiagram/SeqDiagram.vue';
import RootContextWorker from "./root-context-worker.js?worker";
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
import { log } from 'console';
const logger = parentLogger.child({ name: 'core' });

interface IZenUml {
  get code(): string | undefined;
  get theme(): string | undefined;
  // Resolve after rendering is finished.
  // eslint-disable-next-line no-unused-vars
  render(code: string | undefined, theme: string | undefined): Promise<IZenUml>;
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
  }

  async render(code: string | undefined, theme: string | undefined): Promise<IZenUml> {
    logger.debug('rendering', code, theme);
    this._code = code || this._code;
    //console.log("render this._code:"+this._code);
    if(this._code==undefined){
      console.log("this._code is undefined");
      return this;
    }
    this._theme = theme || this._theme;
    // @ts-ignore
    this.store.state.theme = this._theme || 'default';
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }
    let that=this;
    return new Promise(async (resolve) => {
      that.currentTimeout = setTimeout(async () => {
          this._code = code || this._code;
          const rootContext = await that.runWebWorker(that._code);
          console.log("runWebWorker get rootContext:"+(rootContext==null?"null":"[object]"));
          
          // await dispatch will wait until the diagram is finished rendering.
          // It includes the time adjusting the top of participants for creation message.
          // $nextTick is different from setTimeout. The latter will be executed after dispatch has returned.
          // @ts-ignore
          await that.store.dispatch('updateCode', { code: that._code });
          //await that.store.dispatch('updateCode', { code: that._code,rootContext:rootContext });
          resolve(that);
      }, that.getDebounceTime(that._code));
    });
  }

 runWebWorker(code:string | undefined) {
    return new Promise(async (resolve) => {
      console.log('runWebWorker enter');
      const worker = new RootContextWorker();
      worker.onerror = (error:any) => {
        worker.terminate();
      };
      worker.onmessage = (event:any) => {
        let rootContext = event.data;
        resolve(rootContext);
        worker.terminate(); 
      };
      worker.postMessage(code);
    });
  }

  getDebounceTime(code:string | undefined): number  {
    return 1000;
    // if(!code) return 0;
    // let length = code.split('\n').length; 
    // if (length < 50) return 0;
    // if (length < 100) return 100;
    // if (length < 300) return 200;
    // if (length < 500) return 1000;
    // return 5000; 
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
