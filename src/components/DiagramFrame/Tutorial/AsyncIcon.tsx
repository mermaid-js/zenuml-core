import React, { useEffect, useState } from 'react';
import lazyIcons from './LazyIcons';

interface AsyncIconProps {
    iconKey: string;
    className?: string;
    alt?: string;
}

export const AsyncIcon: React.FC<AsyncIconProps> = ({ iconKey, className, alt }) => {
    const [iconContent, setIconContent] = useState<string | null>(null);

    useEffect(() => {
        const loadIcon = async () => {
            if (!iconKey || !lazyIcons[iconKey]) {
                // Try lowercase if exact match fails (legacy behavior support)
                if (iconKey && lazyIcons[iconKey.toLowerCase()]) {
                    const module = await lazyIcons[iconKey.toLowerCase()]();
                    setIconContent(module.default);
                    return;
                }
                return;
            }

            try {
                const module = await lazyIcons[iconKey]();
                setIconContent(module.default);
            } catch (err) {
                console.error(`Failed to load icon: ${iconKey}`, err);
            }
        };

        loadIcon();
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
