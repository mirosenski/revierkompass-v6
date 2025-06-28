import React from 'react';
interface StickyBottomBarProps {
    totalSelected: number;
    onContinue: () => void;
    disabled?: boolean;
}
declare const StickyBottomBar: React.FC<StickyBottomBarProps>;
export default StickyBottomBar;
