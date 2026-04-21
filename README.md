# ClientIQ — Gestion de portefeuille clients
 
Application web de gestion, visualisation et suivi de portefeuille clients, développée en HTML/CSS/JS vanilla.
 
## Structure du projet
 
```
clientiq/
├── index.html                        # Point d'entrée
├── styles/
│   └── globals.css               # Variables CSS, reset, design system
├── utils/
│   ├── state.js                  # État global de l'application
│   ├── toast.js                  # Notifications (US-04)
│   ├── modal.js                  # Système de modales
│   └── logger.js                 # Traçabilité (US-20)
├── components/
│   ├── sidebar.js                # Navigation + rôle (US-17, US-18)
│   └── topbar.js                 # Barre supérieure
└── features/
    ├── import/
    │   ├── import.js             # US-01 : Import CSV
    │   └── import.css
    ├── apercu/
    │   ├── apercu.js             # US-02 : Aperçu tabulaire
    │   └── qualite.js            # US-03 : Détection valeurs manquantes
    ├── dashboard/
    │   ├── dashboard.js          # US-05, US-06 : KPIs globaux
    │   ├── charts.js             # US-07, US-08 : Graphiques segments/risque
    │   └── filters.js            # US-09, US-10 : Filtres segment/risque
    ├── recommandations/
    │   ├── recommandations.js    # US-11 : Recommandations automatiques
    │   ├── classification.js     # US-12 : Relancer / Fidéliser / Surveiller
    │   └── justification.js      # US-13 : Justification des recommandations
    ├── actions/
    │   ├── actions.js            # US-14, US-16 : Création et liste des actions
    │   └── status.js             # US-15 : Gestion des statuts
    ├── securite/
    │   ├── securite.js           # US-17, US-18 : Contrôle d'accès
    │   └── fileGuard.js          # US-19 : Validation des fichiers importés
    └── journal/
        └── journal.js            # US-20 : Journal de traçabilité
└── .gitlab/
    └── merge_requests/               # Descriptions MR par feature
```
 
## Épics et User Stories
 
| Épic | US | Feature | Fichier(s) |
|------|----|---------|------------|
| 1 — Ingestion | US-01 | Import CSV | `features/import/import.js` |
| 1 — Ingestion | US-02 | Aperçu tabulaire | `features/apercu/apercu.js` |
| 1 — Ingestion | US-03 | Qualité des données | `features/apercu/qualite.js` |
| 1 — Ingestion | US-04 | Messages d'erreur | `utils/toast.js` |
| 2 — Visualisation | US-05 | Total clients | `features/dashboard/dashboard.js` |
| 2 — Visualisation | US-06 | CA total | `features/dashboard/dashboard.js` |
| 2 — Visualisation | US-07 | Répartition segments | `features/dashboard/charts.js` |
| 2 — Visualisation | US-08 | Clients à risque | `features/dashboard/charts.js` |
| 2 — Visualisation | US-09 | Filtre segment | `features/dashboard/filters.js` |
| 2 — Visualisation | US-10 | Filtre risque | `features/dashboard/filters.js` |
| 3 — Recommandations | US-11 | Reco automatique | `features/recommandations/recommandations.js` |
| 3 — Recommandations | US-12 | Classification | `features/recommandations/classification.js` |
| 3 — Recommandations | US-13 | Justification | `features/recommandations/justification.js` |
| 4 — Actions | US-14 | Création action | `features/actions/actions.js` |
| 4 — Actions | US-15 | Statut action | `features/actions/status.js` |
| 4 — Actions | US-16 | Liste actions | `features/actions/actions.js` |
| 5 — Sécurité | US-17 | Accès données sensibles | `features/securite/securite.js` |
| 5 — Sécurité | US-18 | Rôles admin/user | `components/sidebar.js` |
| 5 — Sécurité | US-19 | Contrôle fichiers | `features/securite/fileGuard.js` |
| 6 — Traçabilité | US-20 | Journal des actions | `features/journal/journal.js` |
| 6 — Traçabilité | US-21 | README | `README.md` |
 
## Lancement
 
```bash
# Ouvrir directement dans le navigateur
open index.html
 
# Ou via un serveur local
npx serve .
python3 -m http.server 8080
```
 
## Workflow Git / GitLab
 
Chaque user story correspond à une branche + merge request :
 
```bash
git checkout -b feature/US-01-import-csv
# ... développement ...
git push origin feature/US-01-import-csv
# Ouvrir la MR sur GitLab
```
 
Voir `.gitlab/merge_requests/` pour les templates de description de chaque MR.