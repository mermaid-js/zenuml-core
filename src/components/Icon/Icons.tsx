import { cn } from "@/utils";
import { useState, useEffect } from "react";

const Icon = (props: {
  name: string;
  className?: string;
  onClick?: () => void;
}) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const importIcon = async () => {
      try {
        setIsLoading(true);
        // 动态导入图标
        const module = await import(`./icons/${props.name}.svg`);
        setIconUrl(() => module.default || module);
      } catch (error) {
        console.error(`Error loading icon: ${name}`, error);
      } finally {
        setIsLoading(false);
      }
    };

    importIcon();
  }, [props.name]);

  return (
    <span
      className={cn(
        "flex items-center justify-center w-4 h-4",
        props.className,
      )}
      onClick={props.onClick}
    >
      {!isLoading && iconUrl && <img src={iconUrl} />}
    </span>
  );
};

export default Icon;
