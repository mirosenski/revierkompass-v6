import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
export const useWizardStore = create()(persist((set, get) => ({
    currentStep: 1,
    startAddress: '',
    selectedPraesidiumId: null,
    selectedReviereIds: [],
    selectedStations: [],
    selectedCustomAddresses: [],
    setStep: (step) => set({ currentStep: step }),
    setStartAddress: (address) => set({ startAddress: address }),
    selectPraesidium: (id) => set({ selectedPraesidiumId: id }),
    toggleRevier: (id) => set((state) => ({
        selectedReviereIds: state.selectedReviereIds.includes(id)
            ? state.selectedReviereIds.filter((r) => r !== id)
            : [...state.selectedReviereIds, id]
    })),
    setSelectedStations: (stations) => set({ selectedStations: stations }),
    setSelectedCustomAddresses: (addresses) => set({ selectedCustomAddresses: addresses }),
    resetWizard: () => set({
        currentStep: 1,
        startAddress: '',
        selectedPraesidiumId: null,
        selectedReviereIds: [],
        selectedStations: [],
        selectedCustomAddresses: []
    })
}), {
    name: 'wizard-store',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        startAddress: state.startAddress,
        selectedPraesidiumId: state.selectedPraesidiumId,
        selectedReviereIds: state.selectedReviereIds
        // selectedStations und selectedCustomAddresses werden NICHT persistiert
        // damit sie bei jedem Neuladen zurückgesetzt werden
    })
}));
