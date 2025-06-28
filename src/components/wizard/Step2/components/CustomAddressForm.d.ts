import React from 'react';
import { FormData } from '../types';
interface CustomAddressFormProps {
    showAddForm: boolean;
    formData: FormData;
    setFormData: (data: FormData) => void;
    onAddAddress: () => void;
    onCancel: () => void;
}
declare const CustomAddressForm: React.FC<CustomAddressFormProps>;
export default CustomAddressForm;
