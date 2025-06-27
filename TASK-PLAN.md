# 🛠️ Task-Plan: Zentrale Polizeistations-Verwaltung mit Backend-API

## 📋 Übersicht

**Ziel:** Alle Änderungen an Polizeistationen werden zentral gespeichert und sind immer synchron zwischen Admin-UI, Services und allen anderen Bereichen.

**Zeitaufwand:** ~2-3 Tage
**Priorität:** Hoch

---

## 1. Backend-API aufsetzen

### 1.1 Projektstruktur erstellen
- [ ] Neues Verzeichnis `/backend` im Projekt anlegen
- [ ] `package.json` für Backend erstellen
- [ ] Dependencies installieren: `express`, `cors`, `body-parser`

### 1.2 Server-Datei erstellen
- [ ] `backend/server.js` erstellen
- [ ] Express-App konfigurieren
- [ ] CORS aktivieren
- [ ] JSON-Body-Parsing aktivieren
- [ ] Server auf Port 3001 starten

### 1.3 Datenstruktur anlegen
- [ ] `backend/data/` Verzeichnis erstellen
- [ ] `backend/data/polizeistationen.json` mit aktuellen Daten aus `mock-data.ts` erstellen
- [ ] JSON-Struktur validieren

### 1.4 API-Endpoints implementieren

#### GET /api/stationen
- [ ] Alle Polizeistationen aus JSON-Datei lesen
- [ ] Als JSON-Response zurückgeben
- [ ] Fehlerbehandlung implementieren

#### POST /api/stationen
- [ ] Neue Station aus Request-Body extrahieren
- [ ] ID generieren (falls nicht vorhanden)
- [ ] Zur JSON-Datei hinzufügen
- [ ] Aktualisierte Datei speichern
- [ ] Neue Station als Response zurückgeben

#### PUT /api/stationen/:id
- [ ] Station mit gegebener ID finden
- [ ] Mit neuen Daten aus Request-Body aktualisieren
- [ ] Aktualisierte Datei speichern
- [ ] Aktualisierte Station als Response zurückgeben

#### DELETE /api/stationen/:id
- [ ] Station mit gegebener ID finden
- [ ] Aus JSON-Datei entfernen
- [ ] Aktualisierte Datei speichern
- [ ] 204-Status zurückgeben

### 1.5 API testen
- [ ] Server starten: `node backend/server.js`
- [ ] Endpoints mit Postman oder curl testen
- [ ] CRUD-Operationen verifizieren
- [ ] Fehlerbehandlung testen

---

## 2. Frontend/Admin-UI anpassen

### 2.1 API-Service erstellen
- [ ] `src/services/api/backend-api.service.ts` erstellen
- [ ] Funktionen für alle CRUD-Operationen implementieren
- [ ] Fehlerbehandlung einbauen
- [ ] TypeScript-Typen definieren

### 2.2 Admin-Store anpassen
- [ ] `src/store/useAdminStore.ts` modifizieren
- [ ] Alle Datenzugriffe auf Backend-API umstellen
- [ ] Ladezustände und Fehlerbehandlung anpassen
- [ ] Optimistic Updates implementieren (optional)

### 2.3 Admin-Komponenten anpassen
- [ ] `src/components/admin/AdminDashboard.tsx` modifizieren
- [ ] `src/components/admin/AdminStationManagement.tsx` modifizieren
- [ ] Alle lokalen Datenzugriffe entfernen
- [ ] API-Calls integrieren

### 2.4 UI-Verbesserungen
- [ ] Lade-Indikatoren hinzufügen
- [ ] Erfolgs-/Fehlermeldungen verbessern
- [ ] Automatisches Neuladen nach Änderungen
- [ ] Optimistische UI-Updates

---

## 3. Services umstellen

### 3.1 Station-Service anpassen
- [ ] `src/services/api/station.service.ts` modifizieren
- [ ] Alle Funktionen auf Backend-API umstellen
- [ ] Caching implementieren (optional)
- [ ] Fehlerbehandlung verbessern

### 3.2 Admin-Station-Service anpassen
- [ ] `src/services/api/admin-station.service.ts` modifizieren
- [ ] Lokale Datenhaltung entfernen
- [ ] API-Calls integrieren
- [ ] Konsistenz mit Backend-API sicherstellen

### 3.3 Andere Services prüfen
- [ ] Alle anderen Services identifizieren, die Polizeistations-Daten nutzen
- [ ] Auf Backend-API umstellen
- [ ] Tests anpassen

---

## 4. Datenmigration

### 4.1 Aktuelle Daten sichern
- [ ] Backup von `mock-data.ts` erstellen
- [ ] Backup von `public/data/polizeistationen.json` erstellen
- [ ] Aktuelle Daten dokumentieren

### 4.2 Daten in Backend migrieren
- [ ] Alle Daten aus `mock-data.ts` in `backend/data/polizeistationen.json` übertragen
- [ ] JSON-Struktur validieren
- [ ] IDs und Referenzen prüfen
- [ ] Datenintegrität sicherstellen

### 4.3 Alte Dateien bereinigen
- [ ] `mock-data.ts` als Backup behalten (nicht löschen)
- [ ] `public/data/polizeistationen.json` entfernen
- [ ] Import-Statements in Services anpassen

---

## 5. Testing & Qualitätssicherung

### 5.1 Funktionalität testen
- [ ] Alle CRUD-Operationen im Admin-Bereich testen
- [ ] Datenkonsistenz zwischen Admin und anderen Bereichen prüfen
- [ ] Performance testen
- [ ] Fehlerbehandlung testen

### 5.2 Integration testen
- [ ] Frontend mit Backend verbinden
- [ ] End-to-End-Tests durchführen
- [ ] API-Response-Zeiten messen
- [ ] CORS-Konfiguration testen

### 5.3 Browser-Kompatibilität
- [ ] In verschiedenen Browsern testen
- [ ] Mobile Ansicht prüfen
- [ ] Responsive Design validieren

---

## 6. Deployment & Dokumentation

### 6.1 Deployment vorbereiten
- [ ] Backend für Production konfigurieren
- [ ] Environment-Variablen einrichten
- [ ] Logging implementieren
- [ ] Error-Handling verbessern

### 6.2 Dokumentation erstellen
- [ ] API-Dokumentation schreiben
- [ ] Setup-Anleitung für Entwickler
- [ ] Troubleshooting-Guide
- [ ] Changelog erstellen

### 6.3 Monitoring einrichten
- [ ] API-Health-Checks implementieren
- [ ] Performance-Monitoring
- [ ] Error-Tracking
- [ ] Backup-Strategie definieren

---

## 📊 Erfolgskriterien

- [ ] Alle Änderungen im Admin-Bereich sind sofort in allen Services sichtbar
- [ ] Keine manuellen Abgleiche zwischen verschiedenen Datenquellen nötig
- [ ] API-Response-Zeiten unter 500ms
- [ ] 100% Datenkonsistenz zwischen allen Bereichen
- [ ] Alle CRUD-Operationen funktionieren fehlerfrei

---

## 🚨 Risiken & Mitigation

### Risiko: Datenverlust während Migration
**Mitigation:** Mehrfache Backups, schrittweise Migration, Rollback-Plan

### Risiko: Performance-Probleme
**Mitigation:** Caching implementieren, API optimieren, Monitoring einrichten

### Risiko: CORS-Probleme
**Mitigation:** CORS korrekt konfigurieren, verschiedene Browser testen

---

## 📅 Zeitplan

- **Tag 1:** Backend-API aufsetzen (Tasks 1.1 - 1.5)
- **Tag 2:** Frontend anpassen (Tasks 2.1 - 2.4)
- **Tag 3:** Services umstellen und Testing (Tasks 3.1 - 5.3)
- **Tag 4:** Deployment und Dokumentation (Tasks 6.1 - 6.3)

---

**Bereit für die Umsetzung? Starte mit Task 1.1!** 