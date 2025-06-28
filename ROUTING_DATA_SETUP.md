# Open Source Routing Datenoptimierung - Prompt Anfrage

## Kontext
Wir entwickeln ein System zur Routenberechnung zwischen Polizeistationen in Baden-Württemberg. Das System soll **Open Source Routing** (OSRM/OpenRouteService) verwenden, um **präzise Routenberechnungen** für verschiedene Verkehrsmittel zu ermöglichen.

## Aktuelle Situation
- **Datenquelle**: Polizeistationen (Präsidien und Reviere) in Baden-Württemberg
- **Ziel**: Automatische Anlage aller Stationen im Admin-Panel
- **Anforderung**: Datenformat optimiert für Open Source Routing und Kartendarstellung

## Routing-Anforderungen

### Verkehrsmittel
Das System soll Routen für folgende Verkehrsmittel berechnen:
- **Fußgänger** (Walking)
- **Fahrrad** (Cycling)
- **Auto** (Driving)
- **Öffentlicher Verkehr** (Public Transport) - optional

### Routing-Features
- **Echte Straßenverläufe** (nicht Luftlinie)
- **Realistische Geschwindigkeiten** basierend auf Verkehrsmittel
- **Verkehrsregeln** (Einbahnstraßen, Fußgängerzonen, etc.)
- **Höhenprofile** für Fahrrad- und Fußgängerrouten
- **Barrierefreiheit** für Fußgänger
- **Fahrradwege** und -infrastruktur

## Datenformat-Optimierung

### Erforderliche Felder für optimales Routing

```typescript
interface Station {
  // Basis-Identifikation
  id: string;
  name: string;
  type: 'praesidium' | 'revier';
  
  // Präzise Lokalisierung
  coordinates: [number, number]; // [lat, lng] - WICHTIG für Routing
  address: {
    street: string;        // Straße + Hausnummer
    zipCode: string;       // PLZ
    city: string;          // Stadt
    district?: string;     // Stadtteil (optional)
    country: string;       // Land (DE)
  };
  
  // Routing-spezifische Daten
  routing: {
    entranceCoordinates?: [number, number]; // Eingangskoordinaten falls abweichend
    parkingCoordinates?: [number, number];  // Parkplatz-Koordinaten
    accessibility: {
      wheelchair: boolean;
      elevator: boolean;
      ramps: boolean;
    };
    restrictions: {
      noCar?: boolean;     // Fußgängerzone
      noBike?: boolean;    // Fahrradverbot
      emergencyOnly?: boolean; // Nur Notfallverkehr
    };
  };
  
  // Kontakt & Service
  contact: {
    phone: string;
    email?: string;
    emergency24h: boolean;
  };
  
  // Hierarchie
  parentId?: string; // Für Reviere -> Präsidium
}
```

### Koordinaten-Genauigkeit
- **Mindestgenauigkeit**: 6 Dezimalstellen (ca. 1 Meter)
- **Bevorzugt**: 7-8 Dezimalstellen (cm-Genauigkeit)
- **Format**: WGS84 (Standard für GPS)
- **Validierung**: Koordinaten müssen in Deutschland liegen

### Adress-Standardisierung
- **Straße**: Vollständiger Name + Hausnummer
- **PLZ**: 5-stellig, gültig für Deutschland
- **Stadt**: Offizieller Stadtname
- **Land**: Immer "Deutschland" oder "DE"

## Open Source Routing Integration

### OSRM (Open Source Routing Machine)
```bash
# Beispiel API-Call
GET /route/v1/driving/8.681495,49.41461;8.687872,49.420318
```

### OpenRouteService
```bash
# Beispiel API-Call
GET /ors/v2/directions/driving-car?start=8.681495,49.41461&end=8.687872,49.420318
```

### Routing-Parameter
- **Profile**: driving-car, cycling-regular, foot-walking
- **Preference**: fastest, shortest, recommended
- **Units**: meters, kilometers
- **Format**: geojson, gpx, polyline

## Datenqualität für Routing

### Kritische Faktoren
1. **Koordinaten-Genauigkeit**: Je präziser, desto besser die Route
2. **Adress-Konsistenz**: Standardisierte Schreibweise
3. **Eingangskoordinaten**: Falls Haupteingang ≠ Gebäudekoordinaten
4. **Verkehrsbeschränkungen**: Einbahnstraßen, Fußgängerzonen
5. **Barrierefreiheit**: Für Fußgänger-Routing wichtig

### Validierung
- Koordinaten innerhalb Deutschland
- Gültige PLZ für angegebene Stadt
- Telefonnummer im deutschen Format
- E-Mail-Adresse gültig (falls vorhanden)

## Implementierung

### Admin-Panel Erweiterung
- **Bulk-Import**: Alle Stationen auf einmal anlegen
- **Koordinaten-Validierung**: Automatische Prüfung
- **Adress-Standardisierung**: Automatische Formatierung
- **Routing-Test**: Test-Route zwischen zwei Stationen

### Frontend Integration
- **Kartenanzeige**: Alle Stationen auf der Karte
- **Routenberechnung**: Real-time Routing
- **Multi-Modal**: Verschiedene Verkehrsmittel
- **Optimierung**: Beste Route zwischen mehreren Stationen

## Nächste Schritte

1. **Datenaufbereitung**: Alle Stationen mit optimiertem Format
2. **Bulk-Import**: Automatische Anlage im Admin-Panel
3. **Routing-Test**: Validierung der Routenberechnung
4. **Performance-Optimierung**: Caching und Rate Limiting
5. **UI/UX**: Benutzerfreundliche Routenanzeige

## Prompt für KI-Assistent

```
Wir entwickeln ein System zur Routenberechnung zwischen Polizeistationen in Baden-Württemberg. 
Das System verwendet Open Source Routing (OSRM/OpenRouteService) für präzise Routenberechnungen 
für Fußgänger, Fahrrad und Auto.

Aktuell haben wir eine Liste von Polizeistationen (Präsidien und Reviere) mit folgenden Daten:
- Name der Station
- Adresse (Straße, PLZ, Stadt)
- Koordinaten [lat, lng]
- Telefonnummer
- Typ (Präsidium/Revier)
- Übergeordnetes Präsidium (bei Revieren)

Bitte optimiere diese Daten für Open Source Routing und erstelle eine Funktion, die alle Stationen 
automatisch im Admin-Panel anlegt. Die Daten sollen so strukturiert sein, dass sie optimal für 
OSRM/OpenRouteService geeignet sind und präzise Routenberechnungen mit echten Straßenverläufen 
und realistischen Geschwindigkeiten ermöglichen.

Wichtige Anforderungen:
- Koordinaten mit mindestens 6 Dezimalstellen Genauigkeit
- Standardisierte Adressformate
- Validierung der Datenqualität
- Optimierung für verschiedene Verkehrsmittel (Fußgänger, Fahrrad, Auto)
- Berücksichtigung von Verkehrsbeschränkungen und Barrierefreiheit

Bitte erstelle auch eine Validierungsfunktion, die die Routing-Qualität der Daten testet.
```

## Fazit

Die Optimierung der Adressdaten für Open Source Routing ist entscheidend für die Qualität der Routenberechnung. Durch präzise Koordinaten und standardisierte Adressformate können wir realistische Routen mit echten Straßenverläufen und Geschwindigkeiten berechnen.

Die Implementierung sollte schrittweise erfolgen:
1. Datenaufbereitung und -validierung
2. Bulk-Import im Admin-Panel
3. Routing-Integration und -Test
4. Performance-Optimierung
5. Benutzerfreundliche Darstellung 