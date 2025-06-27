import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, MapPin, ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useStationStore } from '@/store/useStationStore';
import { useWizardStore } from '@/store/useWizardStore';
import { useAppStore } from '@/lib/store/app-store';
import ModernNavigation from '../../ModernNavigation';
import { useStep2Logic } from './hooks/useStep2Logic';
import SearchBar from './components/SearchBar';
import ViewSwitcher from './components/ViewSwitcher';
import TabContent from './components/TabContent';
import FloatingActionPanel from './components/FloatingActionPanel';
import toast from 'react-hot-toast';
import Step2CommandDialog from './components/CommandDialog';
import { Building as BuildingIcon, MapPin as MapPinIcon, Trash2, ArrowRight } from 'lucide-react';

const Step2: React.FC = () => {
  const { getStationsByType, getReviereByPraesidium } = useStationStore();
  const { setSelectedStations } = useWizardStore();
  
  const {
    // States
    activeView,
    setActiveView,
    activeTab,
    setActiveTab,
    isPanelOpen,
    setIsPanelOpen,
    searchQuery,
    setSearchQuery,
    showAddForm,
    setShowAddForm,
    expandedPraesidien,
    formData,
    setFormData,
    routes,
    isLoading,
    searchInputRef,
    
    // Store data
    stations,
    selectedStations,
    selectedCustomAddresses,
    customAddresses,
    
    // Functions
    togglePraesidiumWithReviere,
    handleStationToggle,
    togglePraesidiumExpansion,
    handleCustomToggle,
    handleAddAddress,
    handleDeleteAddress,
    handleContinue,
    announceToScreenReader
  } = useStep2Logic();

  const { addCustomAddress } = useAppStore();

  // Sprachsteuerung und Befehle Funktionen
  const handleVoiceCommand = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'de-DE';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        toast.success('Sprachsteuerung aktiviert - Sprechen Sie jetzt');
      };
      
      recognition.onresult = (event: any) => {
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
        } else if (transcript.includes('alle') || transcript.includes('select all')) {
          // Alle sichtbaren Stationen auswählen
          const allVisible = praesidiumWithReviere.flatMap(p => [p.id, ...p.reviere.map(r => r.id)]);
          setSelectedStations([...new Set([...selectedStations, ...allVisible])]);
          toast.success('Alle Stationen ausgewählt');
        } else if (transcript.includes('nichts') || transcript.includes('clear')) {
          // Auswahl löschen
          setSelectedStations([]);
          toast.success('Auswahl gelöscht');
        } else if (transcript.includes('weiter') || transcript.includes('continue')) {
          // Zu Step 3 weitergehen
          handleContinue();
        }
      };
      
      recognition.onerror = (event: any) => {
        toast.error('Fehler bei der Spracherkennung');
        console.error('Speech recognition error:', event.error);
      };
      
      recognition.onend = () => {
        toast.success('Sprachsteuerung beendet');
      };
      
      recognition.start();
    } else {
      toast.error('Sprachsteuerung wird in diesem Browser nicht unterstützt');
    }
  };

  // State für Command Dialog
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false);

  const handleCommandDialog = () => {
    setIsCommandDialogOpen(true);
  };

  const handleCommandExecute = (commandKey: string) => {
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
      icon: BuildingIcon
    },
    { 
      key: 'alle', 
      label: 'Alle Stationen auswählen', 
      description: 'Wählt alle verfügbaren Polizeistationen aus',
      icon: BuildingIcon
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
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // Präsidien mit Revieren und selectedCount
  const praesidien = getStationsByType('praesidium');
  const praesidiumWithReviere = praesidien.map(praesidium => ({
    ...praesidium,
    reviere: getReviereByPraesidium(praesidium.id),
    isExpanded: expandedPraesidien.has(praesidium.id),
    selectedCount: getReviereByPraesidium(praesidium.id)
      .filter(r => selectedStations.includes(r.id)).length
  }));

  // Debug: Log wenn Stationen geladen sind
  useEffect(() => {
    if (stations.length === 0) {
      console.log('⚠️ Keine Stationen geladen!');
    }
  }, [stations, praesidien, praesidiumWithReviere, selectedStations, selectedCustomAddresses, customAddresses]);

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
  const handleMarkerClick = (route: any) => {
    const id = route.id;
    if (selectedStations.includes(id)) {
      setSelectedStations(selectedStations.filter(sid => sid !== id));
    } else {
      setSelectedStations([...selectedStations, id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header mit Such- und Ansichts-Optionen */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="relative flex-1 max-w-xl">
          {/* Suchleiste */}
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onVoiceCommand={handleVoiceCommand}
            onCommand={handleCommandDialog}
          />
        </div>
        
        <div className="flex items-center space-x-3">
          {/* View Switcher */}
          <ViewSwitcher activeView={activeView} setActiveView={setActiveView} />
        </div>
      </div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8"
      >
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'stations' | 'custom')}
                className={`flex-1 flex items-center justify-center space-x-3 py-6 px-4 font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          <TabContent
            activeTab={activeTab}
            activeView={activeView}
            searchQuery={searchQuery}
            praesidiumWithReviere={praesidiumWithReviere}
            selectedStations={selectedStations}
            expandedPraesidien={expandedPraesidien}
            customAddresses={customAddresses}
            selectedCustomAddresses={selectedCustomAddresses}
            routes={routes}
            showAddForm={showAddForm}
            formData={formData}
            setFormData={setFormData}
            onTogglePraesidium={togglePraesidiumWithReviere}
            onExpandPraesidium={togglePraesidiumExpansion}
            onStationToggle={handleStationToggle}
            onCustomToggle={handleCustomToggle}
            onAddAddress={handleAddAddress}
            onCancelAddForm={() => {
              setShowAddForm(false);
              setFormData({ name: '', street: '', zipCode: '', city: '' });
            }}
            onToggleAddForm={() => setShowAddForm(!showAddForm)}
            onMarkerClick={handleMarkerClick}
          />
        </div>
      </motion.div>

      {/* Floating Action Panel */}
      <FloatingActionPanel
        isPanelOpen={isPanelOpen}
        setIsPanelOpen={setIsPanelOpen}
        isLoading={isLoading}
        totalSelected={totalSelected}
        selectedStations={selectedStations}
        selectedCustomAddresses={selectedCustomAddresses}
        stations={stations}
        customAddresses={customAddresses}
        onStationToggle={handleStationToggle}
        onCustomToggle={handleCustomToggle}
      />
      
      {/* Moderne Navigation */}
      <ModernNavigation totalSelected={totalSelected} onContinue={handleContinue} />

      {/* Command Dialog */}
      <Step2CommandDialog
        isOpen={isCommandDialogOpen}
        onClose={() => setIsCommandDialogOpen(false)}
        onCommand={handleCommandExecute}
        commands={commandList}
      />
    </div>
  );
};

export default Step2; 