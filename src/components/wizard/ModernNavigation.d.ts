import React, { ReactNode } from 'react';
interface ModernNavigationProps {
    totalSelected: number;
    onContinue: () => void;
    children?: ReactNode;
}
declare const ModernNavigation: React.FC<ModernNavigationProps>;
export default ModernNavigation;
