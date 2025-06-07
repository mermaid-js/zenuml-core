export const DiagramTitle = (props: { context: any }) => {
  const title = props.context?.content();
  return (
    <div className="title text-skin-title text-base font-semibold">{title}</div>
  );
};
