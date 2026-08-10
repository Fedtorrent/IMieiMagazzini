# <img src="public/MAG_0.png" width="48" height="48" valign="middle"> I Miei Magazzini

**I Miei Magazzini** è un'applicazione moderna e intuitiva per la gestione dell'inventario domestico. Progettata per aiutarti a tenere traccia di prodotti, scadenze e quantità in modo semplice, l'app offre un'esperienza fluida sia su dispositivi mobili (Android) che come Web App (PWA).

L'applicazione segue un approccio **Local-First**, garantendo un'interfaccia reattiva grazie alla cache locale e alla sincronizzazione in background con un database professionale basato su **Supabase (PostgreSQL)**.

---

## 🚀 Funzionalità Principali

- 🛡️ **Sicurezza e Privacy**: Accesso protetto tramite **Codice Familiare** e **PIN** personale. Ogni famiglia ha il proprio spazio isolato e sicuro.
- 📦 **Gestione Inventario**: Aggiungi, modifica, duplica ed elimina prodotti con facilità.
- 📉 **Controllo Quantità**: Aggiornamento rapido delle quantità con feedback visivo immediato (Ottimistic UI).
- 📅 **Monitoraggio Scadenze**: Sistema di avviso automatico per prodotti in scadenza o già scaduti.
- 📂 **Organizzazione**: Suddivisione dei prodotti per **Categorie** e **Posizioni** (es. Dispensa, Frigo, Garage).
- 🔍 **Filtri Avanzati e Ricerca**: Trova istantaneamente ciò che cerchi filtrando per posizione, stato dello stock o scadenze imminenti.
- 🌓 **Tema Chiaro/Scuro**: Supporto completo alla modalità dark per un comfort visivo ottimale.
- 📊 **Dashboard Statistiche**: Visualizzazione grafica della distribuzione dei prodotti per categoria attraverso grafici interattivi.
- 🔄 **Sincronizzazione Cloud**: Grazie a Supabase, i dati sono sempre sincronizzati in modo sicuro su tutti i dispositivi della famiglia.
- 📶 **Supporto Offline**: Continua a lavorare anche senza connessione; le modifiche verranno sincronizzate automaticamente al ritorno online.

---

## 📱 Screenshot

<p align="center">
  <img src="public/MAG_1.jpeg" width="30%" />
  <img src="public/MAG_2.jpeg" width="30%" />
  <img src="public/MAG_3.jpeg" width="30%" />
</p>

<p align="center">
  <img src="public/MAG_4.jpeg" width="30%" />
  <img src="public/MAG_5.jpeg" width="30%" />
  <img src="public/MAG_6.jpeg" width="30%" />
</p>

<p align="center">
  <img src="public/MAG_7.jpeg" width="30%" />
  <img src="public/MAG_8.jpeg" width="30%" />
  <img src="public/MAG_9_Stat.jpeg" width="30%" />
</p>

<p align="center">
  <img src="public/MAG_10_Impo.jpeg" width="30%" />
  <img src="public/MAG_11_Conf.jpeg" width="30%" />
</p>

---

## 🛠️ Tecnologie Utilizzate

- **Frontend**: React 19, TypeScript, Vite.
- **Backend**: **Supabase** (PostgreSQL) per database e persistenza.
- **Styling**: Tailwind CSS.
- **Icone**: Lucide React.
- **Grafici**: Recharts.
- **Mobile**: Capacitor 8.3 (Android).
- **PWA**: Service Worker per installazione su homescreen e uso offline completo.

---

## ⚙️ Configurazione Rapida

L'app non richiede configurazioni tecniche complicate (niente più URL o chiavi API manuali).

1. Al primo avvio, clicca su **"Entra in Famiglia"**.
2. **Crea un nuovo magazzino**: Inserisci un nome unico per la tua famiglia (es. ROSSI-CASA) e imposta un PIN di sicurezza.
3. **Unisciti a un magazzino esistente**: Inserisci il Codice Familiare e il PIN fornito dal creatore.
4. Inizia subito a gestire il tuo magazzino domestico!

---

© 2026 - Sviluppato con ❤️ da **fp** per una gestione domestica più intelligente.
