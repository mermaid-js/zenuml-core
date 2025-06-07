import iconPath from "./Icons";

export const IconList = (props: { types: string[] }) => {
  const icon = (type: string) => {
    if (!type) {
      return null;
    }
    return iconPath[type.toLowerCase() as "actor"];
  };

  return (
    <ul
      role="list"
      className="mt-3 grid grid-cols-4 gap-5 sm:gap-6 sm:grid-cols-6 lg:grid-cols-8"
    >
      {props.types.map((type) => (
        <li
          key={type}
          className="col-span-1 flex flex-col shadow-sm rounded-md"
        >
          <div className="h-12 flex items-center justify-center bg-gray-50 text-sm font-medium rounded-t-md">
            <i
              dangerouslySetInnerHTML={{ __html: icon(type) || "" }}
              className="object-contain h-8 w-8 m-auto [&>svg]:w-full [&>svg]:h-full"
            ></i>
          </div>
          <div className="flex items-center justify-center border-t border-r border-b border-gray-200 bg-white rounded-b-md">
            <div className="px-2 py-2 text-xs">
              <span className="text-gray-900 font-medium hover:text-gray-600">
                @{type}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
