import Icon from "@/components/Icon/Icons";

export const Debug = () => {
  const commitHash = import.meta.env.VITE_APP_GIT_HASH;
  const gitBranch = import.meta.env.VITE_APP_GIT_BRANCH;

  if (!localStorage.zenumlDebug) {
    return null;
  }

  return (
    <div className="flex flex-nowrap m-2 text-sm">
      <div className="ml-4 text-xs inline-flex items-center font-bold leading-sm px-3 py-1 bg-green-200 text-green-700 rounded-sm">
        <Icon name="debug" className="h-4 w-4" />
        <span className="inline-block px-2">
          {gitBranch}:{commitHash}
        </span>
      </div>
    </div>
  );
};
