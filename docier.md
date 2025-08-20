# Spécification Fonctionnelle : Système de Dossier Client

## 🎯 Objectif
Mettre en place un système de **dossiers** pour chaque client, afin d’éviter la duplication de clients lors de visites multiples et de mieux organiser l’historique des services et paiements.

---

## 🏗️ Fonctionnement global

1. **Création d’un client (première fois)**  
   - Lorsqu’un client est créé, un **dossier primaire** lui est automatiquement associé.  
   - Le workflow actuel (ajout services → configuration paiement → validation) reste inchangé, mais est lié à ce dossier.

2. **Nouveaux dossiers (visites ultérieures)**  
   - Quand le client revient plus tard, on ne recrée pas le client.  
   - On ouvre le client existant et on peut créer un **nouveau dossier**.  
   - Chaque dossier contient ses propres services, paiements et historiques.

3. **Consultation des dossiers d’un client**  
   - Dans la page *Client Details*, ajouter un onglet ou une section **Dossiers**.  
   - Cette section liste tous les dossiers du client avec :  
     - Numéro/ID du dossier  
     - Date de création  
     - Statut (en cours, terminé, annulé…)  
     - Montant total payé  
   - En cliquant sur un dossier, on accède à son workflow complet (services + paiements).

---

## ⚙️ Détails techniques

### 1. Base de données
- **Nouvelle table : `dossiers`**  
  - `id` (PK)  
  - `client_id` (FK vers `clients`)  
  - `created_at` (date de création du dossier)  
  - `status` (enum : "en cours", "terminé", "annulé")  

- **Lien services/paiements → dossiers**  
  - Les tables `services` et `paiements` référencent maintenant **un dossier** et non directement le client.  
  - Ainsi, un client peut avoir plusieurs dossiers distincts, chacun avec ses propres services/paiements.

### 2. UI / UX
- **Nouveau bouton : "Créer un dossier"** sur la page d’un client existant.  
- **Liste des dossiers** avec possibilité de voir, modifier ou supprimer un dossier.  
- **Workflow inchangé** à l’intérieur d’un dossier (services → paiement).  
- **Distinction claire** entre l’entité *Client* (infos personnelles) et l’entité *Dossier* (workflow lié).

### 3. Règles de gestion
- Impossible d’ajouter un service ou un paiement **hors dossier**.  
- Un client doit avoir au moins **un dossier** pour commencer un workflow.  
- Lorsqu’on crée un nouveau dossier, les informations personnelles du client sont réutilisées automatiquement.

---

## ✅ Avantages
- Zéro redondance dans la création de clients.  
- Historique clair des visites et des workflows.  
- Plus grande flexibilité : un client peut avoir plusieurs dossiers séparés selon les demandes.  
- Simplicité de consultation et suivi.  