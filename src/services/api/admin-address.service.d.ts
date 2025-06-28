export interface Address {
    id: string;
    name: string;
    street: string;
    zipCode: string;
    city: string;
    coordinates: [number, number];
    isVerified: boolean;
    isActive: boolean;
    reviewStatus: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    user?: {
        id: string;
        email: string;
    };
    parentId?: string;
}
export interface CreateAddressData {
    name: string;
    street: string;
    zipCode: string;
    city: string;
    coordinates: [number, number];
    isVerified?: boolean;
    isActive?: boolean;
    reviewStatus?: 'pending' | 'approved' | 'rejected';
    parentId?: string;
}
export interface UpdateAddressData extends Partial<CreateAddressData> {
}
export declare const adminAddressService: {
    getAllAddresses(): Promise<Address[]>;
    createAddress(addressData: CreateAddressData): Promise<Address>;
    updateAddress(id: string, addressData: UpdateAddressData): Promise<Address>;
    deleteAddress(id: string): Promise<void>;
    approveAddress(id: string): Promise<Address>;
    rejectAddress(id: string, reason?: string): Promise<Address>;
    getPendingAddresses(): Promise<Address[]>;
    getAddressStats(): Promise<any>;
};
export default adminAddressService;
