import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building, MapPin, ArrowRight, Trash2, Users, Target } from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import ModernNavigation from '../ModernNavigation';
import { useStep2Logic } from './hooks/useStep2Logic';
import SearchBar from './components/SearchBar';
import ViewSwitcher from './components/ViewSwitcher';
import TabContent from './components/TabContent';
import FloatingActionPanel from './components/FloatingActionPanel';
import toast from 'react-hot-toast';
import Step2CommandDialog from './components/CommandDialog';
const Step2 = () => {
    const { getStationsByType, getReviereByPraesidium, loadStations, stations } = useStationStore();
    const { setSelectedStations, setSelectedCustomAddresses } = useWizardStore();
    const { setSelectedStations: setAppSelectedStations, setSelectedCustomAddresses: setAppSelectedCustomAddresses } = useAppStore();
    // Lade Stationen beim Mounten der Komponente
    useEffect(() => {
        loadStations();
    }, [loadStations]);
    // Reset-Auswahl beim Laden von Schritt 2
    useEffect(() => {
        // Setze die Auswahl in beiden Stores zurück
        setSelectedStations([]);
        setSelectedCustomAddresses([]);
        setAppSelectedStations([]);
        setAppSelectedCustomAddresses([]);
        // Entferne auch aus localStorage falls vorhanden
        try {
            localStorage.removeItem('wizard-store');
            console.log('🔄 Step2: Alle Auswahlen zurückgesetzt');
        }
        catch (error) {
            console.error('Fehler beim Zurücksetzen der Auswahl:', error);
        }
    }, [setSelectedStations, setSelectedCustomAddresses, setAppSelectedStations, setAppSelectedCustomAddresses]);
    // Debug: Log wenn Stationen geladen sind
    useEffect(() => {
        console.log('🔍 Step2: Stationen geladen:', stations.length);
        const praesidien = getStationsByType('praesidium');
        const reviere = getStationsByType('revier');
        console.log('🔍 Step2: Präsidien:', praesidien.length, 'Reviere:', reviere.length);
    }, [stations, getStationsByType]);
    const { 
    // States
    activeView, setActiveView, activeTab, setActiveTab, isPanelOpen, setIsPanelOpen, searchQuery, setSearchQuery, showAddForm, setShowAddForm, expandedPraesidien, formData, setFormData, routes, isLoading, searchInputRef, 
    // Store data
    selectedStations, selectedCustomAddresses, customAddresses, praesidiumWithReviere, 
    // Functions
    togglePraesidiumWithReviere, handleStationToggle, togglePraesidiumExpansion, handleCustomToggle, handleAddAddress, handleDeleteAddress, handleContinue, announceToScreenReader } = useStep2Logic();
    const { addCustomAddress } = useAppStore();
    // Sprachsteuerung und Befehle Funktionen
    const handleVoiceCommand = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'de-DE';
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.onstart = () => {
                toast.success('Sprachsteuerung aktiviert - Sprechen Sie jetzt');
            };
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                toast.success(`Erkannt: "${transcript}"`);
                // Sprachbefehle verarbeiten
                if (transcript.includes('stuttgart') || transcript.includes('stuttgarter')) {
                    // Alle Stuttgarter Stationen auswählen
                    const stuttgartStations = praesidiumWithReviere
                        .filter(p => p.city.toLowerCase().includes('stuttgart'))
                        .flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
                    setSelectedStations([...new Set([...selectedStations, ...stuttgartStations])]);
                    toast.success('Alle Stuttgarter Stationen ausgewählt');
                }
                else if (transcript.includes('alle') || transcript.includes('select all')) {
                    // Alle sichtbaren Stationen auswählen
                    const allVisible = praesidiumWithReviere.flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
                    setSelectedStations([...new Set([...selectedStations, ...allVisible])]);
                    toast.success('Alle Stationen ausgewählt');
                }
                else if (transcript.includes('nichts') || transcript.includes('clear')) {
                    // Auswahl löschen
                    setSelectedStations([]);
                    toast.success('Auswahl gelöscht');
                }
                else if (transcript.includes('weiter') || transcript.includes('continue')) {
                    // Zu Step 3 weitergehen
                    handleContinue();
                }
            };
            recognition.onerror = (event) => {
                toast.error('Fehler bei der Spracherkennung');
                console.error('Speech recognition error:', event.error);
            };
            recognition.onend = () => {
                toast.success('Sprachsteuerung beendet');
            };
            recognition.start();
        }
        else {
            toast.error('Sprachsteuerung wird in diesem Browser nicht unterstützt');
        }
    };
    // State für Command Dialog
    const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false);
    const handleCommandDialog = () => {
        setIsCommandDialogOpen(true);
    };
    const handleCommandExecute = (commandKey) => {
        const commands = [
            {
                key: 'stuttgart',
                action: () => {
                    const stuttgartStations = praesidiumWithReviere
                        .filter(p => p.city.toLowerCase().includes('stuttgart'))
                        .flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
                    setSelectedStations([...new Set([...selectedStations, ...stuttgartStations])]);
                    toast.success('Alle Stuttgarter Stationen ausgewählt');
                }
            },
            {
                key: 'alle',
                action: () => {
                    const allStations = praesidiumWithReviere.flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
                    setSelectedStations([...new Set([...selectedStations, ...allStations])]);
                    toast.success('Alle Stationen ausgewählt');
                }
            },
            {
                key: 'clear',
                action: () => {
                    setSelectedStations([]);
                    toast.success('Auswahl gelöscht');
                }
            },
            {
                key: 'weiter',
                action: () => {
                    handleContinue();
                }
            }
        ];
        const selectedCommand = commands.find(cmd => cmd.key === commandKey);
        if (selectedCommand) {
            selectedCommand.action();
        }
    };
    const commandList = [
        {
            key: 'stuttgart',
            label: 'Alle Stuttgarter Stationen auswählen',
            description: 'Wählt alle Polizeistationen in Stuttgart aus',
            icon: Building
        },
        {
            key: 'alle',
            label: 'Alle Stationen auswählen',
            description: 'Wählt alle verfügbaren Polizeistationen aus',
            icon: Building
        },
        {
            key: 'clear',
            label: 'Auswahl löschen',
            description: 'Entfernt alle ausgewählten Stationen',
            icon: Trash2
        },
        {
            key: 'weiter',
            label: 'Zu Step 3 weitergehen',
            description: 'Wechselt zum nächsten Schritt',
            icon: ArrowRight
        }
    ];
    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Cmd+K oder Ctrl+K für Befehle
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                handleCommandDialog();
            }
            // Cmd+Shift+V oder Ctrl+Shift+V für Sprachsteuerung
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                handleVoiceCommand();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    const tabs = [
        {
            id: 'stations',
            label: 'Polizeistationen',
            icon: Building,
            count: selectedStations.length
        },
        {
            id: 'custom',
            label: 'Eigene Adressen',
            icon: MapPin,
            count: selectedCustomAddresses.length
        }
    ];
    const totalSelected = selectedStations.length + selectedCustomAddresses.length;
    // Marker click handler
    const handleMarkerClick = (route) => {
        const id = route.id;
        if (selectedStations.includes(id)) {
            setSelectedStations(selectedStations.filter(sid => sid !== id));
        }
        else {
            setSelectedStations([...selectedStations, id]);
        }
    };
    // Berechne Statistiken für die Anzeige
    const selectedPraesidien = praesidiumWithReviere.filter(p => selectedStations.includes(p.id));
    const selectedReviere = selectedStations.filter(id => praesidiumWithReviere.some(p => p.reviere.some(r => r.id === id)));
    const selectedCustomCount = selectedCustomAddresses.length;
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, className: "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 mb-8 border border-blue-200/50 dark:border-blue-800/50", children: [_jsxs("div", { className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg", children: _jsx(Target, { className: "h-8 w-8 text-white" }) }), totalSelected > 0 && (_jsx("div", { className: "absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold animate-pulse", children: totalSelected }))] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 dark:text-white", children: totalSelected === 0 ? 'Keine Ziele ausgewählt' : `${totalSelected} Ziele ausgewählt` }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: totalSelected === 0
                                                    ? 'Wählen Sie Polizeistationen oder eigene Adressen aus'
                                                    : 'Bereit für die Routenberechnung' })] })] }), totalSelected > 0 && (_jsxs("div", { className: "flex flex-wrap gap-4", children: [selectedPraesidien.length > 0 && (_jsxs("div", { className: "flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm", children: [_jsx(Building, { className: "h-5 w-5 text-blue-600" }), _jsxs("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [selectedPraesidien.length, " Pr\u00E4sidien"] })] })), selectedReviere.length > 0 && (_jsxs("div", { className: "flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm", children: [_jsx(Users, { className: "h-5 w-5 text-green-600" }), _jsxs("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [selectedReviere.length, " Reviere"] })] })), selectedCustomCount > 0 && (_jsxs("div", { className: "flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm", children: [_jsx(MapPin, { className: "h-5 w-5 text-orange-600" }), _jsxs("span", { className: "text-sm font-medium text-gray-900 dark:text-white", children: [selectedCustomCount, " Eigene Adressen"] })] }))] }))] }), totalSelected > 0 && (_jsxs("div", { className: "mt-6", children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2", children: [_jsx("span", { children: "Auswahl-Fortschritt" }), _jsxs("span", { children: [totalSelected, " von ", praesidiumWithReviere.length + selectedCustomCount, " m\u00F6glichen Zielen"] })] }), _jsx("div", { className: "w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3", children: _jsx(motion.div, { className: "bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full", initial: { width: 0 }, animate: { width: `${Math.min((totalSelected / (praesidiumWithReviere.length + selectedCustomCount)) * 100, 100)}%` }, transition: { duration: 0.5, ease: "easeOut" } }) })] }))] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-center mb-8 gap-4", children: [_jsx("div", { className: "relative flex-1 max-w-xl", children: _jsx(SearchBar, { searchQuery: searchQuery, onSearchChange: setSearchQuery, onVoiceCommand: handleVoiceCommand, onCommand: handleCommandDialog }) }), _jsx("div", { className: "flex items-center space-x-3", children: _jsx(ViewSwitcher, { activeView: activeView, setActiveView: setActiveView }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8", children: [_jsx("div", { className: "flex border-b border-gray-200 dark:border-gray-700", children: tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex-1 flex items-center justify-center space-x-3 py-6 px-4 font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`, children: [_jsx(Icon, { className: "h-5 w-5" }), _jsx("span", { children: tab.label }), tab.count > 0 && (_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-bold ${isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`, children: tab.count }))] }, tab.id));
                        }) }), _jsx("div", { className: "p-8", children: _jsx(TabContent, { activeTab: activeTab, activeView: activeView, searchQuery: searchQuery, praesidiumWithReviere: praesidiumWithReviere, selectedStations: selectedStations, expandedPraesidien: expandedPraesidien, customAddresses: customAddresses, selectedCustomAddresses: selectedCustomAddresses, routes: routes, showAddForm: showAddForm, formData: formData, setFormData: setFormData, onTogglePraesidium: togglePraesidiumWithReviere, onExpandPraesidium: togglePraesidiumExpansion, onStationToggle: handleStationToggle, onCustomToggle: handleCustomToggle, onAddAddress: handleAddAddress, onCancelAddForm: () => {
                                setShowAddForm(false);
                                setFormData({ name: '', street: '', zipCode: '', city: '' });
                            }, onToggleAddForm: () => setShowAddForm(!showAddForm), onMarkerClick: handleMarkerClick }) })] }), _jsx(FloatingActionPanel, { isPanelOpen: isPanelOpen, setIsPanelOpen: setIsPanelOpen, isLoading: isLoading, totalSelected: totalSelected, selectedStations: selectedStations, selectedCustomAddresses: selectedCustomAddresses, stations: stations, customAddresses: customAddresses, onStationToggle: handleStationToggle, onCustomToggle: handleCustomToggle }), _jsx(ModernNavigation, { totalSelected: totalSelected, onContinue: handleContinue }), _jsx(Step2CommandDialog, { isOpen: isCommandDialogOpen, onClose: () => setIsCommandDialogOpen(false), onCommand: handleCommandExecute, commands: commandList })] }));
};
export default Step2;
