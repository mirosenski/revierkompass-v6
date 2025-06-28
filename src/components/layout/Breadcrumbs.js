import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { ChevronRight, Home, Settings, LogIn } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
const Breadcrumbs = ({ currentView }) => {
    const { wizard } = useAppStore();
    const getBreadcrumbs = () => {
        const items = [
            { label: 'RevierKompass', icon: Home, active: false }
        ];
        if (currentView === 'wizard') {
            items.push({ label: 'Routing Wizard', icon: null, active: false });
            if (wizard.currentStep >= 1) {
                items.push({ label: 'Schritt 1: Adresse', icon: null, active: wizard.currentStep === 1 });
            }
            if (wizard.currentStep >= 2) {
                items.push({ label: 'Schritt 2: Ziele auswählen', icon: null, active: wizard.currentStep === 2 });
            }
            if (wizard.currentStep >= 3) {
                items.push({ label: 'Schritt 3: Export', icon: null, active: wizard.currentStep === 3 });
            }
        }
        else if (currentView === 'login') {
            items.push({ label: 'Anmeldung', icon: LogIn, active: true });
        }
        else if (currentView === 'admin') {
            items.push({ label: 'Admin Dashboard', icon: Settings, active: true });
        }
        return items;
    };
    const breadcrumbs = getBreadcrumbs();
    return (_jsx("div", { className: "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200/30 dark:border-gray-700/30", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex items-center space-x-2 py-3 text-sm", children: breadcrumbs.map((item, index) => {
                    const Icon = item.icon;
                    const isLast = index === breadcrumbs.length - 1;
                    return (_jsxs(React.Fragment, { children: [_jsxs("div", { className: `flex items-center space-x-2 ${item.active
                                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                                    : 'text-gray-500 dark:text-gray-400'}`, children: [Icon && _jsx(Icon, { className: "h-4 w-4" }), _jsx("span", { children: item.label })] }), !isLast && (_jsx(ChevronRight, { className: "h-4 w-4 text-gray-400 dark:text-gray-500" }))] }, index));
                }) }) }) }));
};
export default Breadcrumbs;
