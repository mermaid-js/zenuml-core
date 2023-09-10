import parentLogger from './logger/logger';
import ZenUml from './core';
const logger = parentLogger.child({ name: 'main' });

// find the fist element with tag `pre` and class `zenuml`
const elm = document.querySelector('pre.zenuml');
// get the code from the element
const code =
  elm?.textContent?.trim() ||
  `
// comment
A
A.method`;
// @ts-ignore
const zenUml = new ZenUml(elm);
console.log('set zenUML to window');

// DON'T REMOVE: headlessui portal root hack
// ref: https://github.com/tailwindlabs/headlessui/discussions/666#discussioncomment-4966117
const portalRootElement = document.createElement('div')
portalRootElement.setAttribute('id', 'headlessui-portal-root')
portalRootElement.setAttribute('class', 'zenuml')
portalRootElement.append(document.createElement('div'))

document.body.append(portalRootElement)

// @ts-ignore
window.zenUml = zenUml;
zenUml.render(code, {theme: 'theme-nab'}).then((r) => {
  logger.debug('render resolved', r);
});
// @ts-ignore
window.parentLogger = parentLogger;
