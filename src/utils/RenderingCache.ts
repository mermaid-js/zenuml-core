let  dic: Record<string, any> = {};
let  persistDic: Record<string, any> = {};

export const getCache = (key:string | undefined) => {
  if(key)
  {
    if (dic[key] !== undefined) {
      return dic[key];
    }
    if (persistDic[key] !== undefined) {
      return persistDic[key];
    }
  }
  return null;
};

export const setCache = (key:string,value:any,persist:boolean=false) => {
  dic[key] = value;
  if(persist){
    persistDic[key] = value;
    return;
  }
  
};

//Need call clearCache before rendering.
export const clearCache = () => {
  dic={};
};