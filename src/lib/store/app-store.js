import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Initial State
const initialWizardState = {
    currentStep: 1,
    startAddress: null,
    selectedCities: [],
    selectedStations: [],
    selectedCustomAddresses: [],
    routeResults: []
};
// Baden-Württemberg Center
const BW_CENTER = [48.6616, 9.3501];
// Store Implementation
export const useAppStore = create()(persist((set, get) => ({
    // Theme
    isDarkMode: false,
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    // Wizard State
    wizard: initialWizardState,
    setWizardStep: (step) => set((state) => ({
        wizard: { ...state.wizard, currentStep: step }
    })),
    setStartAddress: (address) => set((state) => ({
        wizard: { ...state.wizard, startAddress: address }
    })),
    setSelectedCities: (cities) => set((state) => ({
        wizard: { ...state.wizard, selectedCities: cities }
    })),
    setSelectedStations: (stations) => set((state) => ({
        wizard: { ...state.wizard, selectedStations: stations }
    })),
    setSelectedCustomAddresses: (addresses) => set((state) => ({
        wizard: { ...state.wizard, selectedCustomAddresses: addresses }
    })),
    setRouteResults: (results) => set((state) => ({
        wizard: { ...state.wizard, routeResults: results }
    })),
    resetWizard: () => set({ wizard: initialWizardState }),
    // Custom Addresses
    customAddresses: [],
    addCustomAddress: (address) => {
        set((state) => {
            const newAddress = {
                ...address,
                address: `${address.street}, ${address.zipCode} ${address.city}`,
                id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date(),
                isSelected: false
            };
            const updatedAddresses = [...state.customAddresses, newAddress];
            return { customAddresses: updatedAddresses };
        });
    },
    updateCustomAddress: (id, updates) => set((state) => ({
        customAddresses: state.customAddresses.map(addr => addr.id === id ? { ...addr, ...updates } : addr)
    })),
    deleteCustomAddress: (id) => {
        set((state) => ({
            customAddresses: state.customAddresses.filter(addr => addr.id !== id),
            wizard: {
                ...state.wizard,
                selectedCustomAddresses: state.wizard.selectedCustomAddresses.filter(addrId => addrId !== id)
            }
        }));
    },
    toggleCustomAddressSelection: (id) => set((state) => {
        const isSelected = state.wizard.selectedCustomAddresses.includes(id);
        return {
            wizard: {
                ...state.wizard,
                selectedCustomAddresses: isSelected
                    ? state.wizard.selectedCustomAddresses.filter(addrId => addrId !== id)
                    : [...state.wizard.selectedCustomAddresses, id]
            },
            customAddresses: state.customAddresses.map(addr => addr.id === id ? { ...addr, isSelected: !isSelected } : addr)
        };
    }),
    clearCustomAddressSelection: () => set((state) => ({
        wizard: {
            ...state.wizard,
            selectedCustomAddresses: []
        },
        customAddresses: state.customAddresses.map(addr => ({ ...addr, isSelected: false }))
    })),
    // Loading States
    isLoadingGeocode: false,
    isLoadingRoutes: false,
    isCalculating: false,
    setLoadingGeocode: (loading) => set({ isLoadingGeocode: loading }),
    setLoadingRoutes: (loading) => set({ isLoadingRoutes: loading }),
    setCalculating: (calculating) => set({ isCalculating: calculating }),
    // Map State
    mapCenter: BW_CENTER,
    mapZoom: 8,
    mapPitch: 0,
    mapBearing: 0,
    setMapView: (center, zoom, pitch = 0, bearing = 0) => set({
        mapCenter: center,
        mapZoom: zoom,
        mapPitch: pitch,
        mapBearing: bearing
    }),
    // Error States
    error: null,
    setError: (error) => set({ error }),
    // Station Data
    stations: [],
    setStations: (stations) => set({ stations })
}), {
    name: 'revierkompass-v2-storage',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        customAddresses: state.customAddresses,
        // Wizard-Zustand wird nicht persistiert, damit immer mit Schritt 1 begonnen wird
        // wizard: {
        //   ...state.wizard,
        //   routeResults: [] // Don't persist route results
        // }
    }),
    onRehydrateStorage: () => (state) => {
        if (state) {
            // Custom-Adressen erfolgreich aus localStorage geladen
        }
    },
}));
