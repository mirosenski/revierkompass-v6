import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X, Search, Check } from 'lucide-react';
const Step2CommandDialog = ({ isOpen, onClose, onCommand, commands }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const filteredCommands = commands.filter(cmd => cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.key.toLowerCase().includes(searchQuery.toLowerCase()));
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen)
                return;
            switch (e.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev => prev < filteredCommands.length - 1 ? prev + 1 : 0);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredCommands.length - 1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        onCommand(filteredCommands[selectedIndex].key);
                        onClose();
                    }
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, onCommand, onClose]);
    if (!isOpen)
        return null;
    return (_jsx(AnimatePresence, { children: _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, className: "bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Command, { className: "h-5 w-5 text-blue-600" }), _jsx("h2", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "Befehle" })] }), _jsx("button", { onClick: onClose, className: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors", children: _jsx(X, { className: "h-5 w-5 text-gray-500" }) })] }), _jsx("div", { className: "p-4 border-b border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Befehle durchsuchen...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white", autoFocus: true })] }) }), _jsx("div", { className: "max-h-64 overflow-y-auto", children: filteredCommands.length === 0 ? (_jsx("div", { className: "p-4 text-center text-gray-500 dark:text-gray-400", children: "Keine Befehle gefunden" })) : (filteredCommands.map((command, index) => {
                            const Icon = command.icon;
                            return (_jsxs(motion.button, { onClick: () => {
                                    onCommand(command.key);
                                    onClose();
                                }, className: `w-full flex items-center space-x-3 p-4 text-left transition-colors ${index === selectedIndex
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`, onMouseEnter: () => setSelectedIndex(index), children: [_jsx(Icon, { className: "h-5 w-5" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium text-gray-900 dark:text-white", children: command.label }), _jsx("div", { className: "text-sm text-gray-500 dark:text-gray-400", children: command.description })] }), index === selectedIndex && (_jsx(Check, { className: "h-5 w-5 text-blue-600" }))] }, command.key));
                        })) }), _jsx("div", { className: "p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400", children: _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "\u2191\u2193 Navigieren" }), _jsx("span", { children: "\u21B5 Ausf\u00FChren" }), _jsx("span", { children: "ESC Schlie\u00DFen" })] }) })] }) }) }));
};
export default Step2CommandDialog;
