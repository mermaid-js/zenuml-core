let dic: Record<string, any> = {};
const persistDic: Record<string, any> = {};

export const getCache = (key: string | undefined): any => {
  if (key != null) {
    const cacheValue = dic[key] ?? persistDic[key];
    return cacheValue !== undefined ? cacheValue : null;
  }
  return null;
};

export const setCache = (key: string, value: any, persist: boolean = false) => {
  dic[key] = value;
  if (persist) {
    persistDic[key] = value;
  }
};

//Need call clearCache before rendering.
export const clearCache = () => {
  dic = {};
};
