import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, MapPin, Plus, CheckCircle2 } from 'lucide-react';
import InteractiveMap from '@/components/map/InteractiveMap';
import PraesidiumCard from './PraesidiumCard';
import CustomAddressForm from './CustomAddressForm';
import { animationVariants } from '../animations/variants';

interface TabContentProps {
  activeTab: 'stations' | 'custom';
  activeView: 'grid' | 'list' | 'compact' | 'map';
  searchQuery: string;
  praesidiumWithReviere: any[];
  selectedStations: string[];
  expandedPraesidien: Set<string>;
  customAddresses: any[];
  selectedCustomAddresses: string[];
  routes: any[];
  showAddForm: boolean;
  formData: any;
  setFormData: (data: any) => void;
  onTogglePraesidium: (id: string) => void;
  onExpandPraesidium: (id: string) => void;
  onStationToggle: (id: string) => void;
  onCustomToggle: (id: string) => void;
  onAddAddress: () => void;
  onCancelAddForm: () => void;
  onToggleAddForm: () => void;
  onMarkerClick: (route: any) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  activeView,
  searchQuery,
  praesidiumWithReviere,
  selectedStations,
  expandedPraesidien,
  customAddresses,
  selectedCustomAddresses,
  routes,
  showAddForm,
  formData,
  setFormData,
  onTogglePraesidium,
  onExpandPraesidium,
  onStationToggle,
  onCustomToggle,
  onAddAddress,
  onCancelAddForm,
  onToggleAddForm,
  onMarkerClick
}) => {
  return (
    <AnimatePresence mode="wait">
      {activeTab === 'stations' && (
        <motion.div
          key="stations"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* View Content */}
          <AnimatePresence mode="wait">
            {activeView === 'grid' && (
              <motion.div
                key="grid"
                variants={animationVariants.container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {praesidiumWithReviere
                  .filter(p => 
                    searchQuery === '' || 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((praesidium) => (
                    <PraesidiumCard
                      key={praesidium.id}
                      praesidium={praesidium}
                      onToggle={onTogglePraesidium}
                      onExpand={() => onExpandPraesidium(praesidium.id)}
                      onStationToggle={onStationToggle}
                      selectedStations={selectedStations}
                      viewMode="grid"
                      expandedPraesidien={expandedPraesidien}
                    />
                  ))}
              </motion.div>
            )}
            
            {activeView === 'list' && (
              <motion.div
                key="list"
                variants={animationVariants.container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {praesidiumWithReviere
                  .filter(p => 
                    searchQuery === '' || 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((praesidium) => (
                    <motion.div
                      key={praesidium.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                    >
                      <PraesidiumCard
                        praesidium={praesidium}
                        onToggle={onTogglePraesidium}
                        onExpand={() => onExpandPraesidium(praesidium.id)}
                        onStationToggle={onStationToggle}
                        selectedStations={selectedStations}
                        viewMode="list"
                        expandedPraesidien={expandedPraesidien}
                      />
                    </motion.div>
                  ))}
              </motion.div>
            )}
            
            {activeView === 'compact' && (
              <motion.div
                key="compact"
                variants={animationVariants.container}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {praesidiumWithReviere
                  .filter(p => 
                    searchQuery === '' || 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.reviere.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  )
                  .map((praesidium) => (
                    <motion.div
                      key={praesidium.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        praesidium.selectedCount > 0
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => onTogglePraesidium(praesidium.id)}
                      whileHover={{ x: 4 }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={praesidium.selectedCount > 0}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-blue-600" />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">{praesidium.name}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({praesidium.city})</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{praesidium.reviere.length} Reviere</span>
                          {praesidium.selectedCount > 0 && (
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                              {praesidium.selectedCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </motion.div>
            )}

            {activeView === 'map' && (
              <div className="py-4">
                <InteractiveMap
                  routeResults={routes}
                  startAddress="Stuttgart, Schlossplatz"
                  startCoordinates={{ lat: 48.7784, lng: 9.1806 }}
                  onMarkerClick={onMarkerClick}
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {activeTab === 'custom' && (
        <motion.div
          key="custom"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Add Address Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Eigene Adressen verwalten
            </h3>
            <button
              onClick={onToggleAddForm}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Neue Adresse</span>
            </button>
          </div>

          {/* Add Form */}
          <CustomAddressForm
            showAddForm={showAddForm}
            formData={formData}
            setFormData={setFormData}
            onAddAddress={onAddAddress}
            onCancel={onCancelAddForm}
          />

          {/* Custom Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(() => {
              if (customAddresses.length === 0) {
                return (
                  <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine eigenen Adressen vorhanden.</p>
                    <p className="text-sm">Fügen Sie Ihre erste Adresse hinzu!</p>
                  </div>
                );
              }
              
              const filteredAddresses = customAddresses.filter(addr => 
                searchQuery === '' || 
                addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                addr.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                addr.street.toLowerCase().includes(searchQuery.toLowerCase())
              );
              
              return filteredAddresses.map((address) => {
                return (
                  <motion.div
                    key={address.id}
                    className={`address-card p-6 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-lg ${
                      selectedCustomAddresses.includes(address.id) 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                    onClick={() => onCustomToggle(address.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {address.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {address.street}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {address.zipCode} {address.city}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className={`h-6 w-6 transition-colors ${
                        selectedCustomAddresses.includes(address.id) 
                          ? 'text-green-500' 
                          : 'text-gray-300 dark:text-gray-600'
                      }`} />
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TabContent; 