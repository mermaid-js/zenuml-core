import Icon from "@/components/Icon/Icons";

export const Debug = () => {
  if (!localStorage.zenumlDebug) return null;

  return (
    <div className="text-xs inline-flex items-center font-mono font-medium leading-sm mx-1 px-3 py-1 bg-slate-100 text-slate-500 rounded-sm">
      <Icon name="debug" className="h-3 w-3" />
      <span className="inline-block px-2">
        {import.meta.env.VITE_APP_GIT_BRANCH}:{import.meta.env.VITE_APP_GIT_HASH}
      </span>
    </div>
  );
};
