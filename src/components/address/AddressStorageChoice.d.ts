import React from 'react';
interface AddressStorageChoiceProps {
    onStorageTypeSelect: (type: 'temporary' | 'permanent') => void;
    selectedType?: 'temporary' | 'permanent';
}
declare const AddressStorageChoice: React.FC<AddressStorageChoiceProps>;
export default AddressStorageChoice;
