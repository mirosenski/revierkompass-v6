export interface AddressData {
    name: string;
    address: string;
    city: string;
    coordinates: [number, number];
    type: 'praesidium' | 'revier';
    telefon: string;
    parentId?: string;
}
export declare const aalenAddresses: AddressData[];
export declare const createAllAalenAddresses: () => Promise<number>;
