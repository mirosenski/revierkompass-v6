import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { importAllAddresses, showAddressStats, testAPIConnection } from '@/scripts/import-addresses';

const AddressImporter: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ totalCreated: number; totalErrors: number } | null>(null);
  const [currentStats, setCurrentStats] = useState<{ totalAddresses: number; cityCount: number } | null>(null);
  const [dbStationCount, setDbStationCount] = useState<number | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      const result = await importAllAddresses();
      setImportResult(result);
      
      // Aktualisiere die Statistiken nach dem Import
      setTimeout(() => {
        showAddressStats();
        testAPIConnection().then(count => setDbStationCount(count));
      }, 1000);
      
    } catch (error) {
      console.error('Import fehlgeschlagen:', error);
      setImportResult({ totalCreated: 0, totalErrors: 1 });
    } finally {
      setIsImporting(false);
    }
  };

  const handleShowStats = () => {
    const stats = showAddressStats();
    setCurrentStats(stats);
  };

  const handleTestConnection = async () => {
    const count = await testAPIConnection();
    setDbStationCount(count);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center space-x-3 mb-6">
        <Database className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Adress-Import Manager
        </h2>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Verfügbare Adressen
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {currentStats?.totalAddresses || '?'}
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-300 ml-1">
              in {currentStats?.cityCount || '?'} Städten
            </span>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              In Datenbank
            </span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-green-900 dark:text-green-100">
              {dbStationCount || '?'}
            </span>
            <span className="text-sm text-green-600 dark:text-green-300 ml-1">
              Stationen
            </span>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Import Status
            </span>
          </div>
          <div className="mt-2">
            {importResult ? (
              <div>
                <span className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {importResult.totalCreated}
                </span>
                <span className="text-sm text-orange-600 dark:text-orange-300 ml-1">
                  importiert
                </span>
                {importResult.totalErrors > 0 && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {importResult.totalErrors} Fehler
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm text-orange-600 dark:text-orange-300">
                Bereit zum Import
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Aktionen */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleShowStats}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Database className="h-4 w-4" />
            <span>Statistiken anzeigen</span>
          </button>

          <button
            onClick={handleTestConnection}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>DB-Verbindung testen</span>
          </button>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Importiere...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Alle Adressen importieren</span>
              </>
            )}
          </button>
        </div>

        {/* Info-Box */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Adress-Import Information
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Dieser Import lädt alle verfügbaren Polizeistationen aus den Daten-Dateien in die Datenbank. 
                Das umfasst Präsidien und Reviere aus 13 Städten in Baden-Württemberg. 
                Der Import kann einige Minuten dauern.
              </p>
            </div>
          </div>
        </div>

        {/* Import-Ergebnis */}
        {importResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-4 rounded-lg border-l-4 ${
              importResult.totalErrors === 0 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-400' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400'
            }`}
          >
            <div className="flex items-center space-x-3">
              {importResult.totalErrors === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Import abgeschlossen
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {importResult.totalCreated} Stationen erfolgreich importiert
                  {importResult.totalErrors > 0 && ` (${importResult.totalErrors} Fehler aufgetreten)`}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AddressImporter; 