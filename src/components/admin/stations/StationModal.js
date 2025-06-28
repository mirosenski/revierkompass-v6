import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { INITIAL_FORM_DATA } from './types';
import { useFormValidation } from './hooks';
import { LoadingSpinner } from './LoadingSpinner';
export const StationModal = React.memo(({ station, isOpen, onClose, onSave, isLoading, error, availablePraesidien }) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const { errors, isValid } = useFormValidation(formData);
    // Form zurücksetzen bei Modal-Öffnung/Schließung
    useEffect(() => {
        if (isOpen) {
            if (station) {
                setFormData({
                    name: station.name || '',
                    address: station.address || '',
                    city: station.city || '',
                    telefon: station.telefon || '',
                    email: station.email || '',
                    coordinates: station.coordinates || [0, 0],
                    type: station.type || 'revier',
                    notdienst24h: station.notdienst24h || false,
                    isActive: station.isActive !== false,
                    parentId: station.parentId || '',
                });
            }
            else {
                setFormData(INITIAL_FORM_DATA);
            }
        }
    }, [station, isOpen]);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!isValid) {
            toast.error('Bitte korrigieren Sie die Eingabefehler');
            return;
        }
        try {
            await onSave(formData);
            toast.success(station ? 'Station erfolgreich aktualisiert' : 'Station erfolgreich erstellt');
        }
        catch (err) {
            console.error('❌ Fehler beim Speichern:', err);
            toast.error('Fehler beim Speichern der Station');
        }
    }, [formData, isValid, onSave, station]);
    const handleInputChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);
    const handleCoordinateChange = useCallback((index, value) => {
        const numValue = parseFloat(value) || 0;
        setFormData(prev => ({
            ...prev,
            coordinates: [
                index === 0 ? numValue : prev.coordinates[0],
                index === 1 ? numValue : prev.coordinates[1]
            ]
        }));
    }, []);
    if (!isOpen)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { className: "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300", children: [_jsx("div", { className: "sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 rounded-t-2xl z-10", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: station ? 'Station bearbeiten' : 'Neue Station erstellen' }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors", "aria-label": "Schlie\u00DFen", children: _jsx(X, { className: "w-5 h-5 text-gray-500 dark:text-gray-400" }) })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [error && (_jsxs("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-red-800 dark:text-red-200", children: [_jsx(AlertTriangle, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: "Fehler" })] }), _jsx("p", { className: "text-red-700 dark:text-red-300 mt-1", children: error })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Name *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), className: `w-full px-4 py-3 rounded-xl border transition-colors ${errors.name
                                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} dark:bg-gray-700`, placeholder: "z.B. Polizeipr\u00E4sidium Stuttgart" }), errors.name && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.name }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Typ *" }), _jsxs("select", { value: formData.type, onChange: (e) => handleInputChange('type', e.target.value), className: "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors", children: [_jsx("option", { value: "praesidium", children: "Pr\u00E4sidium" }), _jsx("option", { value: "revier", children: "Revier" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Adresse *" }), _jsx("input", { type: "text", value: formData.address, onChange: (e) => handleInputChange('address', e.target.value), className: `w-full px-4 py-3 rounded-xl border transition-colors ${errors.address
                                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} dark:bg-gray-700`, placeholder: "z.B. Hahnemannstra\u00DFe 1" }), errors.address && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.address }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Stadt *" }), _jsx("input", { type: "text", value: formData.city, onChange: (e) => handleInputChange('city', e.target.value), className: `w-full px-4 py-3 rounded-xl border transition-colors ${errors.city
                                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} dark:bg-gray-700`, placeholder: "z.B. Stuttgart" }), errors.city && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.city }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Telefon *" }), _jsx("input", { type: "tel", value: formData.telefon, onChange: (e) => handleInputChange('telefon', e.target.value), className: `w-full px-4 py-3 rounded-xl border transition-colors ${errors.telefon
                                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} dark:bg-gray-700`, placeholder: "z.B. 0711 8990-0" }), errors.telefon && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.telefon }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "E-Mail" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => handleInputChange('email', e.target.value), className: `w-full px-4 py-3 rounded-xl border transition-colors ${errors.email
                                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} dark:bg-gray-700`, placeholder: "z.B. info@polizei-stuttgart.de" }), errors.email && (_jsx("p", { className: "mt-1 text-sm text-red-600 dark:text-red-400", children: errors.email }))] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Breitengrad (Latitude) *" }), _jsx("input", { type: "number", step: "any", value: formData.coordinates[0], onChange: (e) => handleCoordinateChange(0, e.target.value), className: `w-full px-4 py-3 rounded-xl border transition-colors ${errors.coordinates
                                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} dark:bg-gray-700`, placeholder: "z.B. 48.810460" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "L\u00E4ngengrad (Longitude) *" }), _jsx("input", { type: "number", step: "any", value: formData.coordinates[1], onChange: (e) => handleCoordinateChange(1, e.target.value), className: `w-full px-4 py-3 rounded-xl border transition-colors ${errors.coordinates
                                                    ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500'} dark:bg-gray-700`, placeholder: "z.B. 9.186860" })] })] }), errors.coordinates && (_jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4", children: _jsx("p", { className: "text-red-700 dark:text-red-300 text-sm", children: errors.coordinates }) })), formData.type === 'revier' && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "\u00DCbergeordnetes Pr\u00E4sidium" }), _jsxs("select", { value: formData.parentId, onChange: (e) => handleInputChange('parentId', e.target.value), className: "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors", children: [_jsx("option", { value: "", children: "Kein Pr\u00E4sidium zugeordnet" }), availablePraesidien.map(praesidium => (_jsx("option", { value: praesidium.id, children: praesidium.name }, praesidium.id)))] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", id: "notdienst24h", checked: formData.notdienst24h, onChange: (e) => handleInputChange('notdienst24h', e.target.checked), className: "w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0" }), _jsx("label", { htmlFor: "notdienst24h", className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "24h Notdienst" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", id: "isActive", checked: formData.isActive, onChange: (e) => handleInputChange('isActive', e.target.checked), className: "w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0" }), _jsx("label", { htmlFor: "isActive", className: "text-sm font-medium text-gray-700 dark:text-gray-300", children: "Aktiv" })] })] }), _jsxs("div", { className: "flex items-center justify-end gap-4 pt-6 border-t dark:border-gray-700", children: [_jsx("button", { type: "button", onClick: onClose, className: "px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium", children: "Abbrechen" }), _jsxs("button", { type: "submit", disabled: !isValid || isLoading, className: "flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2", children: [isLoading && _jsx(LoadingSpinner, { size: "sm" }), station ? 'Aktualisieren' : 'Erstellen'] })] })] })] })] }));
});
StationModal.displayName = 'StationModal';
