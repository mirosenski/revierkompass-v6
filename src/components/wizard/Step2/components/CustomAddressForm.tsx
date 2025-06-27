import React from 'react';
import { motion } from 'framer-motion';
import { FormData } from '../types';

interface CustomAddressFormProps {
  showAddForm: boolean;
  formData: FormData;
  setFormData: (data: FormData) => void;
  onAddAddress: () => void;
  onCancel: () => void;
}

const CustomAddressForm: React.FC<CustomAddressFormProps> = ({
  showAddForm,
  formData,
  setFormData,
  onAddAddress,
  onCancel
}) => {
  if (!showAddForm) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
    >
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Neue Adresse hinzufügen
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name/Bezeichnung
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="z.B. Büro, Zuhause"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Straße
          </label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            placeholder="z.B. Musterstraße 123"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            PLZ
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            placeholder="z.B. 70173"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Stadt
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="z.B. Stuttgart"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex space-x-3 mt-4">
        <button
          onClick={onAddAddress}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Hinzufügen
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </motion.div>
  );
};

export default CustomAddressForm; 