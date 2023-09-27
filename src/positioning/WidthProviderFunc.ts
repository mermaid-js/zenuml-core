import {TextType} from '@/positioning/Coordinate';
import {getStartTime, printCostTime } from "./../utils/CostTime"
import { getCache,setCache } from "./../utils/RenderingCache"
export default function WidthProviderOnBrowser(text: string, type: TextType): number {
  let start=getStartTime();
  let cacheKey=text+"_"+type;
  let cacheValue=getCache(cacheKey);
  if(cacheValue!=null)
  {
    printCostTime("WidthProviderOnBrowser"+" cacheKey:"+cacheKey+" scrollWidth(cached):"+cacheValue,start);
    return cacheValue;
  }
  let hiddenDiv = document.querySelector('.textarea-hidden-div') as HTMLDivElement;
  if (!hiddenDiv) {
    const newDiv = document.createElement('div');
    newDiv.className = 'textarea-hidden-div ';
    newDiv.style.fontSize = (type === TextType.MessageContent) ? '0.875rem' : '1rem';
    newDiv.style.fontFamily = 'Helvetica, Verdana, serif';
    newDiv.style.display = 'inline';
    // newDiv.style.zIndex = '-9999';
    newDiv.style.whiteSpace = 'nowrap';
    newDiv.style.visibility = 'hidden';
    newDiv.style.position = 'absolute';
    newDiv.style.top = '0';
    newDiv.style.left = '0';
    newDiv.style.overflow = 'hidden';
    newDiv.style.width = '0px';
    // newDiv.style.height = '0px';
    newDiv.style.paddingLeft = '0px';
    newDiv.style.paddingRight = '0px';
    newDiv.style.margin = '0px';
    newDiv.style.border = '0px';
    document.body.appendChild(newDiv);
    hiddenDiv = newDiv;
  }
  // hiddenDiv.className = 'textarea-hidden-div ' + (type === TextType.ParticipantName ? 'participant' : 'message');

  hiddenDiv.textContent = text;
  const scrollWidth = hiddenDiv.scrollWidth;
  setCache(cacheKey,scrollWidth);
  printCostTime("WidthProviderOnBrowser"+" cacheKey:"+cacheKey+" scrollWidth:"+scrollWidth,start);
  return scrollWidth;
}
