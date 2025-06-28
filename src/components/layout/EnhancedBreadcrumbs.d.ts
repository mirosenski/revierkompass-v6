import React from 'react';
interface BreadcrumbsProps {
    currentView: 'wizard' | 'login' | 'admin';
    onNavigate?: (view: 'wizard' | 'login' | 'admin', step?: number) => void;
}
declare const EnhancedBreadcrumbs: React.FC<BreadcrumbsProps>;
export default EnhancedBreadcrumbs;
