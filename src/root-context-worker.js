import { RootContext } from './parser/index.js';
self.onmessage = function(event) {
    try{
      console.log('root-context-worker enter');
      let code = event.data;
      let rootContext = RootContext(code);
      const serializedObj = JSON.stringify(rootContext);
      //const transferableObj = { rootContext };
      //self.postMessage(transferableObj, [transferableObj.rootContext]);
      self.postMessage(serializedObj);
      console.log('root-context-worker end');

    }catch(ex){
      console.log('root-context-worker error:'+ex);
    }
  };

