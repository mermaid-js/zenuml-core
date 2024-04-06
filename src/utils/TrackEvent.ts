export const trackEvent = (
  store: any,
  label: string,
  action: string,
  category: string,
): void => {
  store.commit("trackEvent", { label, action, category });
};
