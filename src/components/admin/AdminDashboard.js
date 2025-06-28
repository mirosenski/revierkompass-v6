import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Building2, MapPin, Settings, BarChart3 } from 'lucide-react';
import { AdminStationManagement } from './stations';
import { AdminAddressManagement } from './addresses';
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('stations');
    const tabs = [
        {
            id: 'stations',
            label: 'Stationen',
            icon: Building2,
            description: 'Polizeipräsidien und Reviere verwalten'
        },
        {
            id: 'addresses',
            label: 'Adressen',
            icon: MapPin,
            description: 'Benutzer-Adressen verwalten und genehmigen'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            description: 'Statistiken und Berichte'
        },
        {
            id: 'settings',
            label: 'Einstellungen',
            icon: Settings,
            description: 'System-Einstellungen'
        }
    ];
    const renderTabContent = () => {
        switch (activeTab) {
            case 'stations':
                return _jsx(AdminStationManagement, {});
            case 'addresses':
                return _jsx(AdminAddressManagement, {});
            case 'analytics':
                return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 pb-20", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-4", children: "Analytics & Berichte" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Analytics-Funktionen werden in K\u00FCrze verf\u00FCgbar sein." })] }) }) }));
            case 'settings':
                return (_jsx("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900 pb-20", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: _jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-4", children: "System-Einstellungen" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "System-Einstellungen werden in K\u00FCrze verf\u00FCgbar sein." })] }) }) }));
            default:
                return _jsx(AdminStationManagement, {});
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [_jsx("div", { className: "sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-3 py-6 px-4 font-medium transition-all duration-200 border-b-2 ${isActive
                                    ? 'text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`, children: [_jsx(Icon, { className: "h-5 w-5" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-semibold", children: tab.label }), _jsx("div", { className: "text-xs opacity-75", children: tab.description })] })] }, tab.id));
                        }) }) }) }), _jsx("div", { className: "flex-1", children: renderTabContent() })] }));
};
export default AdminDashboard;
