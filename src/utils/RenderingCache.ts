const  dic: { [key: string]: any } = {};

function getDictionarySize(): number {
  return Object.keys(dic).length;
}

export const getCache = (key:string | undefined) => {
  if (key && dic[key] !== undefined) {
    return dic[key];
  }
  return null;
};

export const setCache = (key:string| undefined,value:any) => {
  // @ts-ignore
  dic[key] = value;
};

//Need call clearCache before rendering.
export const clearCache = () => {
  Object.keys(dic).forEach(key => delete dic[key]);
};