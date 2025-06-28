import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Shield, Sun, Moon, LogIn, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store/app-store';
import { useAuthStore } from '@/lib/store/auth-store';
const Header = ({ onAdminLogin, onBackToWizard, onGoToAdmin, currentView }) => {
    const { isDarkMode, toggleTheme } = useAppStore();
    const { isAuthenticated, isAdmin, logout, user } = useAuthStore();
    const handleLogout = () => {
        logout();
        onBackToWizard();
    };
    return (_jsx(motion.header, { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, ease: "easeOut" }, className: "sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex justify-between items-center h-20", children: [_jsxs(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, className: "flex items-center space-x-4 cursor-pointer select-none", onClick: () => {
                            console.log('🔄 Logo geklickt - handleBackToWizard wird aufgerufen');
                            onBackToWizard();
                        }, children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur-lg opacity-30" }), _jsx("div", { className: "relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-3 rounded-2xl shadow-xl", children: _jsx(Shield, { className: "h-8 w-8 text-white" }) })] }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("h1", { className: "text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent", children: "RevierKompass" }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 font-medium", children: "Polizei Baden-W\u00FCrttemberg" })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [currentView !== 'wizard' && (_jsxs(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: onBackToWizard, className: "flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors", children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Zur\u00FCck zum Wizard" })] })), _jsx(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: toggleTheme, className: "p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 shadow-md hover:shadow-lg", children: isDarkMode ? (_jsx(Sun, { className: "h-5 w-5" })) : (_jsx(Moon, { className: "h-5 w-5" })) }), !isAuthenticated ? (_jsxs(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: onAdminLogin, className: "flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium", children: [_jsx(LogIn, { className: "h-4 w-4" }), _jsx("span", { children: "Als Admin anmelden" })] })) : (_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs(motion.div, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: () => {
                                            console.log('Admin-Badge geklickt, onGoToAdmin:', onGoToAdmin);
                                            if (onGoToAdmin) {
                                                onGoToAdmin();
                                            }
                                            else if (currentView !== 'admin') {
                                                // Fallback falls onGoToAdmin nicht übergeben wurde
                                                console.log('Fallback: Navigation zum Admin-Dashboard');
                                                window.location.href = '#admin'; // Temporärer Fallback
                                            }
                                        }, className: "hidden sm:flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-200", children: [_jsx(Settings, { className: "h-4 w-4 text-green-600 dark:text-green-400" }), _jsx("span", { className: "text-sm font-medium text-green-800 dark:text-green-200", children: user?.username || 'Admin' })] }), _jsxs(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: handleLogout, className: "flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200", children: [_jsx(LogOut, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: "Abmelden" })] })] }))] })] }) }) }));
};
export default Header;
