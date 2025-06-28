export interface AddressData {
    name: string;
    address: string;
    city: string;
    coordinates: [number, number];
    type: 'praesidium' | 'revier';
    telefon: string;
    parentId?: string;
}
export declare const heilbronnAddresses: AddressData[];
export declare const createAllHeilbronnAddresses: () => Promise<number>;
