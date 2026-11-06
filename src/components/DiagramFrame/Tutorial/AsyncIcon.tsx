import React, { useEffect, useState } from "react";
import { loadIcon } from "./LazyIcons";

interface AsyncIconProps {
  iconKey: string;
  className?: string;
  alt?: string;
}

export const AsyncIcon: React.FC<AsyncIconProps> = ({
  iconKey,
  className,
  alt,
}) => {
  const [iconContent, setIconContent] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIconContent(await loadIcon(iconKey));
      } catch (err) {
        console.error(`Failed to load icon: ${iconKey}`, err);
      }
    };

    load();
  }, [iconKey]);

  if (!iconContent) {
    // Render empty placeholder with same dimensions to prevent layout shift
    return <div className={className} />;
  }

  return (
    <div
      className={className}
      aria-description={alt}
      dangerouslySetInnerHTML={{ __html: iconContent }}
    />
  );
};
