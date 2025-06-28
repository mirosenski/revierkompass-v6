import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Clock, Shield, Info, Check } from 'lucide-react';
const AddressStorageChoice = ({ onStorageTypeSelect, selectedType }) => {
    const [showInfo, setShowInfo] = useState(false);
    const storageOptions = [
        {
            type: 'temporary',
            title: 'Temporäre Speicherung',
            subtitle: 'Nur für diese Sitzung',
            description: 'Die Adresse wird nur lokal in Ihrem Browser gespeichert und automatisch gelöscht, wenn Sie die Seite verlassen.',
            icon: Clock,
            color: 'blue',
            benefits: [
                'Keine Registrierung erforderlich',
                'Völlig anonym',
                'Automatische Löschung',
                'Sofort verfügbar'
            ]
        },
        {
            type: 'permanent',
            title: 'Permanente Speicherung',
            subtitle: 'Zur Überprüfung einreichen',
            description: 'Die Adresse wird anonymisiert an Administratoren zur Überprüfung gesendet und nach Genehmigung dauerhaft verfügbar.',
            icon: Save,
            color: 'green',
            benefits: [
                'Für alle Nutzer verfügbar',
                'Qualitätsprüfung durch Admins',
                'Dauerhafte Verfügbarkeit',
                'Trägt zur Verbesserung bei'
            ]
        }
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-2", children: "Speicher-Option w\u00E4hlen" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 text-sm", children: "Wie m\u00F6chten Sie diese Adresse speichern?" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: storageOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedType === option.type;
                    return (_jsxs(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: () => onStorageTypeSelect(option.type), className: `relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected
                            ? option.color === 'blue'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'}`, children: [isSelected && (_jsx(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, className: `absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${option.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`, children: _jsx(Check, { className: "h-4 w-4 text-white" }) })), _jsx("div", { className: `w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${option.color === 'blue'
                                    ? 'bg-blue-100 dark:bg-blue-900/30'
                                    : 'bg-green-100 dark:bg-green-900/30'}`, children: _jsx(Icon, { className: `h-6 w-6 ${option.color === 'blue'
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-green-600 dark:text-green-400'}` }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: option.title }), _jsx("p", { className: `text-sm font-medium ${option.color === 'blue'
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-green-600 dark:text-green-400'}`, children: option.subtitle })] }), _jsx("p", { className: "text-gray-600 dark:text-gray-300 text-sm leading-relaxed", children: option.description }), _jsxs("div", { className: "space-y-2", children: [_jsx("h5", { className: "text-sm font-medium text-gray-900 dark:text-white", children: "Vorteile:" }), _jsx("ul", { className: "space-y-1", children: option.benefits.map((benefit, index) => (_jsxs("li", { className: "flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300", children: [_jsx("div", { className: `w-1.5 h-1.5 rounded-full ${option.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}` }), _jsx("span", { children: benefit })] }, index))) })] })] })] }, option.type));
                }) }), _jsx(motion.div, { initial: { opacity: 0, height: 0 }, animate: {
                    opacity: showInfo ? 1 : 0,
                    height: showInfo ? 'auto' : 0
                }, className: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(Shield, { className: "h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" }), _jsxs("div", { className: "space-y-2", children: [_jsx("h5", { className: "font-medium text-gray-900 dark:text-white", children: "Datenschutz & Sicherheit" }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-300 space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "Tempor\u00E4re Speicherung:" }), " Daten verbleiben ausschlie\u00DFlich in Ihrem Browser und werden nicht an externe Server \u00FCbertragen."] }), _jsxs("p", { children: [_jsx("strong", { children: "Permanente Speicherung:" }), " Nur die Adressdaten (Name, Stra\u00DFe, PLZ, Stadt) werden anonymisiert \u00FCbertragen. Keine pers\u00F6nlichen Daten oder IP-Adressen werden gespeichert."] })] })] })] }) }), _jsx("div", { className: "text-center", children: _jsxs("button", { onClick: () => setShowInfo(!showInfo), className: "inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors", children: [_jsx(Info, { className: "h-4 w-4" }), _jsxs("span", { children: [showInfo ? 'Weniger' : 'Mehr', " Informationen"] })] }) })] }));
};
export default AddressStorageChoice;
