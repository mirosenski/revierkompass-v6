import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import StickyBottomBar from './StickyBottomBar';
function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia(query);
        const handler = (e) => setMatches(e.matches);
        setMatches(mql.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [query]);
    return matches;
}
const ModernNavigation = ({ totalSelected, onContinue, children }) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    return (_jsxs(_Fragment, { children: [_jsx("div", { children: children }), totalSelected > 0 && (_jsx(StickyBottomBar, { totalSelected: totalSelected, onContinue: onContinue, disabled: false }))] }));
};
export default ModernNavigation;
