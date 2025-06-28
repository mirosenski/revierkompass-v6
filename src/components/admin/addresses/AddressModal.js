import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
const AddressModal = ({ address, isOpen, onClose, onSave, isLoading = false, error = null, availablePraesidien = [] }) => {
    const [formData, setFormData] = useState({
        name: '',
        street: '',
        zipCode: '',
        city: '',
        coordinates: [0, 0],
        isVerified: false,
        isActive: true,
        reviewStatus: 'pending',
        parentId: '',
    });
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (address && isOpen) {
            setFormData({
                name: address.name || '',
                street: address.street || '',
                zipCode: address.zipCode || '',
                city: address.city || '',
                coordinates: address.coordinates || [0, 0],
                isVerified: address.isVerified || false,
                isActive: address.isActive !== false,
                reviewStatus: address.reviewStatus || 'pending',
                parentId: address.parentId || '',
            });
        }
        else if (!address && isOpen) {
            setFormData({
                name: '',
                street: '',
                zipCode: '',
                city: '',
                coordinates: [0, 0],
                isVerified: false,
                isActive: true,
                reviewStatus: 'pending',
                parentId: '',
            });
        }
    }, [address, isOpen]);
    if (!isOpen)
        return null;
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name)
            newErrors.name = 'Name ist erforderlich';
        if (!formData.street)
            newErrors.street = 'Straße ist erforderlich';
        if (!formData.zipCode)
            newErrors.zipCode = 'PLZ ist erforderlich';
        if (!formData.city)
            newErrors.city = 'Stadt ist erforderlich';
        if (!formData.coordinates[0] || !formData.coordinates[1])
            newErrors.coordinates = 'Koordinaten sind erforderlich';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSave = () => {
        if (validateForm()) {
            onSave(formData);
            onClose();
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", role: "dialog", "aria-modal": "true", children: _jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [_jsx("div", { className: "fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity", onClick: onClose }), _jsxs("div", { className: "inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full", children: [_jsx("div", { className: "px-6 py-4 border-b dark:border-gray-700", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: address ? 'Adresse bearbeiten' : 'Neue Adresse erstellen' }) }), _jsxs("div", { className: "px-6 py-4 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Name *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), className: `w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent` }), errors.name && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.name })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Stra\u00DFe *" }), _jsx("input", { type: "text", value: formData.street, onChange: (e) => setFormData(prev => ({ ...prev, street: e.target.value })), className: `w-full px-4 py-2 rounded-lg border ${errors.street ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent` }), errors.street && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.street })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "PLZ *" }), _jsx("input", { type: "text", value: formData.zipCode, onChange: (e) => setFormData(prev => ({ ...prev, zipCode: e.target.value })), className: `w-full px-4 py-2 rounded-lg border ${errors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent` }), errors.zipCode && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.zipCode })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Stadt *" }), _jsx("input", { type: "text", value: formData.city, onChange: (e) => setFormData(prev => ({ ...prev, city: e.target.value })), className: `w-full px-4 py-2 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent` }), errors.city && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.city })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Koordinaten *" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx("input", { type: "number", step: "0.0001", placeholder: "Breitengrad", value: formData.coordinates[0], onChange: (e) => setFormData(prev => ({
                                                                ...prev,
                                                                coordinates: [Number(e.target.value), prev.coordinates[1]]
                                                            })), className: `w-full px-4 py-2 rounded-lg border ${errors.coordinates ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent` }), _jsx("input", { type: "number", step: "0.0001", placeholder: "L\u00E4ngengrad", value: formData.coordinates[1], onChange: (e) => setFormData(prev => ({
                                                                ...prev,
                                                                coordinates: [prev.coordinates[0], Number(e.target.value)]
                                                            })), className: `w-full px-4 py-2 rounded-lg border ${errors.coordinates ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent` })] }), errors.coordinates && _jsx("p", { className: "text-red-500 text-xs mt-1", children: errors.coordinates })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Status" }), _jsxs("select", { value: formData.reviewStatus, onChange: (e) => setFormData(prev => ({
                                                        ...prev,
                                                        reviewStatus: e.target.value
                                                    })), className: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent", children: [_jsx("option", { value: "pending", children: "Ausstehend" }), _jsx("option", { value: "approved", children: "Genehmigt" }), _jsx("option", { value: "rejected", children: "Abgelehnt" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1", children: "Pr\u00E4sidium (optional)" }), _jsxs("select", { value: formData.parentId, onChange: (e) => setFormData(prev => ({ ...prev, parentId: e.target.value })), className: "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent", children: [_jsx("option", { value: "", children: "Kein Pr\u00E4sidium zugeordnet" }), availablePraesidien.map((praesidium) => (_jsx("option", { value: praesidium.id, children: praesidium.name }, praesidium.id)))] })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: formData.isVerified, onChange: (e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked })), className: "w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0" }), _jsx("span", { children: "Verifiziert" })] }), _jsxs("label", { className: "flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: formData.isActive, onChange: (e) => setFormData(prev => ({ ...prev, isActive: e.target.checked })), className: "w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0" }), _jsx("span", { children: "Aktiv" })] })] }), error && (_jsx("div", { className: "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3", children: _jsx("p", { className: "text-red-600 dark:text-red-400 text-sm", children: error }) }))] }), _jsxs("div", { className: "px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex justify-end gap-3", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors", children: "Abbrechen" }), _jsx("button", { onClick: handleSave, disabled: isLoading, className: "px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors flex items-center gap-2", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Speichern..."] })) : (_jsxs(_Fragment, { children: [_jsx(MapPin, { className: "w-4 h-4" }), "Speichern"] })) })] })] })] }) }));
};
export default AddressModal;
