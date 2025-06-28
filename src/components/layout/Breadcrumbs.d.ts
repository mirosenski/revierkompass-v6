import React from 'react';
interface BreadcrumbsProps {
    currentView: 'wizard' | 'login' | 'admin';
}
declare const Breadcrumbs: React.FC<BreadcrumbsProps>;
export default Breadcrumbs;
