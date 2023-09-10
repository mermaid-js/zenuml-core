self.onmessage = function(event) {
    
    console.log(event.data)
    //renderZenuml (window,code);
  };
  
  function renderZenuml(window,code) {
    waitUntil(
        () => {
          return window.zenUml;
        },
        () => {
          window.zenUml.render(code, 'theme-default').then((r) => {
            window.parentLogger.child({ name: 'index.html' }).debug('render resolved', r);
          });
        }
      );
      // write cm.getValue() to localStorage
      localStorage.setItem('zenuml-cm-code',code);
  }


  function waitUntil(condition, callback) {
    if (condition()) {
      callback();
    } else {
      setTimeout(function () {
        waitUntil(condition, callback);
      }, 100);
    }
  }

