import parentLogger from './logger/logger';
import ZenUml from './core';
const logger = parentLogger.child({ name: 'main' });

// find the fist element with tag `pre` and class `zenuml`
const elm = document.querySelector('#diagram');
// get the code from the element
const code = `"><img src=x onerror=alert(1)>`;
// @ts-ignore
const zenUml = new ZenUml(elm);
// @ts-ignore
window.zenUml = zenUml;
zenUml.render(code, {theme: 'theme-default'}).then((r) => {
  logger.debug('render resolved', r);
});
// @ts-ignore
window.parentLogger = parentLogger;
