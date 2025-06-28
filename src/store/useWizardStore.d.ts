interface WizardStore {
    currentStep: 1 | 2 | 3;
    startAddress: string;
    selectedPraesidiumId: string | null;
    selectedReviereIds: string[];
    selectedStations: string[];
    selectedCustomAddresses: string[];
    setStep: (step: 1 | 2 | 3) => void;
    setStartAddress: (address: string) => void;
    selectPraesidium: (id: string) => void;
    toggleRevier: (id: string) => void;
    setSelectedStations: (stations: string[]) => void;
    setSelectedCustomAddresses: (addresses: string[]) => void;
    resetWizard: () => void;
}
export declare const useWizardStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<WizardStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<WizardStore, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: WizardStore) => void) => () => void;
        onFinishHydration: (fn: (state: WizardStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<WizardStore, unknown>>;
    };
}>;
export {};
