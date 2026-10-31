import type { HTMLAttributes, ReactNode } from "react";
import { usePageTitleFocus } from "../../hooks/usePageTitleFocus";

export interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
}

export default function PageTitle({ className = "", ...props }: PageTitleProps) {
    const focusTitle = usePageTitleFocus();
    return <h1 {...props} ref={focusTitle} tabIndex={-1} className={`page-title-focus ${className}`} />;
}
