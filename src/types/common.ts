import type { ReactNode } from "react";

export default interface GenericComponentProps {
    className?: string;
    id?: string;
    children?: ReactNode;
}
