
# Visa Office – Cursor Execution Checklist

> **But / Scope**
> Construire un MVP **NestJS + Prisma (PostgreSQL) + Next.js** avec **Sidebar (Dashboard, Client Portal)**, en se concentrant d’abord sur **Client Portal** (New / Existing).  
> Stockage fichiers **local** (MVP). Auth avec rôles **admin** (full access) et **user** (lecture seule: clients).  
> **Visa Types**: Tourist, Spouse, Family Reunion, Study, Professional Internship, Student Internship, Work, Medical, Other.

---

## 0. Préparation & Standards
- [ ] Créer un dépôt mono-repo (ou 2 repos) `backend/` (Nest) et `frontend/` (Next).
- [ ] Ajouter un README racine décrivant l’architecture et les commandes.
- [ ] Activer **lint/format** back & front (ESLint + Prettier) et **Husky** (pre-commit).
- [ ] Fichier `.editorconfig` partagé.
- [ ] Créer `.env.example` back & front.

---

## 1. Backend – Bootstrap (NestJS + Prisma + Postgres)
- [ ] Initialiser un projet **NestJS** `visa-office` (TS).
- [ ] Installer **Prisma** + client PostgreSQL.
- [ ] Configurer **ConfigModule** pour lire `.env`.
- [ ] Ajouter **ValidationPipe** global + class-validator/class-transformer.
- [ ] Exposer **Swagger** à `/docs` (OpenAPI).

### 1.1 Prisma – Schéma & Migration
- [ ] Écrire le schéma Prisma avec les modèles **Client**, **PhoneNumber**, **Employer**, **Attachment**, **FamilyMember** et enums **ClientType**, **ClientStatus**, **AttachmentType**.
- [ ] Inclure champs requis: `clientType`, `status`, `fullName`, `address`, `email`, `destination`, etc.
- [ ] Lancer `prisma migrate dev` et vérifier la base locale.
- [ ] Générer le client Prisma.

### 1.2 Configuration Postgres (local)
- [ ] Créer un `docker-compose.yml` pour Postgres (port, user, password, db).
- [ ] Vérifier la connexion depuis le backend via `DATABASE_URL`.

---

## 2. Backend – Auth (JWT) & Rôles
- [ ] Module **auth**: `POST /auth/login` (email/password factice pour MVP ou seed admin).
- [ ] Générer un **JWT** avec rôle dans le payload (`admin` ou `user`).
- [ ] **AuthGuard** + **RolesGuard** (decorator `@Roles('admin')`).
- [ ] Protéger toutes les routes `/api/v1/**` (lecture autorisée pour `user` seulement là où applicable).
- [ ] Créer endpoint `GET /auth/me` pour retourner l’utilisateur courant.
- [ ] **Tests e2e** simples: login, accès autorisé/refusé.

---

## 3. Backend – Module Meta
- [ ] `GET /api/v1/meta/client-statuses` → `["NEW","IN_REVIEW","PENDING_DOCS","APPROVED","REJECTED"]`.
- [ ] `GET /api/v1/meta/visa-types` → `["Tourist","Spouse","Family Reunion","Study","Professional Internship","Student Internship","Work","Medical","Other"]`.
- [ ] Tests unitaires du contrôleur.

---

## 4. Backend – Clients (CRUD + Règles Métiers)
- [ ] `POST /api/v1/clients` – créer client + numéros + employeurs (transaction).
- [ ] Règle: si `clientType !== "PHONE_CALL"`, **passportNumber requis**.
- [ ] `GET /api/v1/clients` – pagination serveur + filtres (`status`, `clientType`, `search` sur `fullName/email/passportNumber`).
- [ ] `GET /api/v1/clients/:id` – détail avec relations (phones, employers, attachments, familyMembers).
- [ ] `PATCH /api/v1/clients/:id` – maj partielle, gestion arrays (ajout/suppression phones & employers).
- [ ] `DELETE /api/v1/clients/:id` – soft delete (ou hard pour MVP, à consigner).
- [ ] DTO + validation (class-validator) et Zod optionnel en service.
- [ ] Tests unitaires du service (création, update, filtres, règles métier).

### 4.1 Family & Group (MVP basique)
- [ ] `POST /api/v1/clients/:id/family-members` – création.
- [ ] `DELETE /api/v1/family-members/:id` – suppression.
- [ ] Inclure dans le détail client.

---

## 5. Backend – Upload Fichiers (Local)
- [ ] Module **attachments**: Multer (disk storage dans `uploads/`).
- [ ] Valider MIME: `pdf`, `jpg`, `jpeg`, `png`; taille max 10 MB.
- [ ] `POST /api/v1/clients/:id/attachments` (multipart `file`, champ `type`).
- [ ] `GET /api/v1/clients/:id/attachments` – lister.
- [ ] `DELETE /api/v1/attachments/:attachmentId` – supprimer (fichier + meta).
- [ ] Servir les fichiers via route protégée JWT (ou static + guard).
- [ ] Tests: upload réussi, type refusé, suppression.

---

## 6. Frontend – Bootstrap (Next.js 14, App Router, Tailwind, shadcn/ui)
- [ ] Initialiser Next.js (App Router).
- [ ] Installer Tailwind CSS et config de base.
- [ ] Installer shadcn/ui et générer composants nécessaires (Button, Input, Select, Tabs, Table, Dialog, Toast).
- [ ] Configurer un **API client** (fetch/axios) avec intercepteurs (Auth header, erreurs).
- [ ] Créer mise en page avec **Sidebar** persistante: **Dashboard** (`/dashboard`) et **Client Portal** (`/clients`).

---

## 7. Frontend – Auth (MVP)
- [ ] Page `/login` (form email/password), appel `POST /auth/login`.
- [ ] Stocker token (httpOnly cookie ou memory + refresh plus tard).
- [ ] HOC/guard client ou middleware pour protéger routes app.
- [ ] Afficher rôle et bouton logout.
- [ ] Rôle `user`: lecture seule — masquer actions de création/édition/suppression.

---

## 8. Frontend – Client Portal (Navigation)
- [ ] Route `/clients` avec **Tabs**: **New Client** (`/clients/new`) et **Existing Clients** (`/clients/list`).
- [ ] Fil d’Ariane / Breadcrumbs.

### 8.1 New Client
- [ ] Afficher 4 boutons/cartes: **Individual**, **Family**, **Group**, **Phone Call**.
- [ ] À la sélection, ouvrir **formulaire commun** avec `clientType` pré-rempli.
- [ ] Champs: Full Name*, Address*, Job Title, Passport Number* (sauf Phone Call), Email*, Destination*, Visa Type (select via `/meta/visa-types`), Notes, Phone Numbers (array dynamique), Employers (array dynamique), Upload (passport/visa).
- [ ] Validation client: react-hook-form + zod, messages clairs.
- [ ] Submit: `POST /api/v1/clients`; si fichier, enchaîner upload `POST /clients/:id/attachments`.
- [ ] Toast succès/erreur + redirection vers la fiche.

### 8.2 Existing Clients (List)
- [ ] Table: Name, Type, Status, Destination, Email, UpdatedAt, Actions.
- [ ] Filtres: search, status, type; pagination serveur.
- [ ] SWR (ou React Query) pour cache et révalidation.
- [ ] Action **View / Edit** → page `/clients/[id]` ou drawer modal.

### 8.3 Client Detail (View / Edit)
- [ ] Charger `GET /api/v1/clients/:id`.
- [ ] Rôle `admin`: **édition inline** (PATCH) des champs + arrays dynamiques.
- [ ] Rôle `user`: **lecture seule** (inputs désactivés, pas de boutons Save/Delete).
- [ ] Bloc **Attachments**: liste, upload, delete.
- [ ] Afficher `createdAt/updatedAt`.
- [ ] Gestion des erreurs et states (loading, empty).

---

## 9. Qualité, Tests & DX
- [ ] **Types partagés** (OpenAPI typesafe ou `zod-to-ts`).
- [ ] **Unit tests** backend (services, guards).
- [ ] **e2e tests** simples (Supertest): login, CRUD client, permissions rôle `user`.
- [ ] **Front tests** minimaux (forms validation, table filtres) avec Vitest/RTL.
- [ ] Scripts `npm run dev`, `build`, `test`, `lint` back & front.
- [ ] GitHub Actions (optionnel) : lint + test.

---

## 10. Déploiement local & Docs
- [ ] `docker-compose` : Postgres + pgadmin (optionnel).
- [ ] Scripts `seed` pour créer un admin et un user.
- [ ] Documenter `.env.example` (DB creds, JWT secret, UPLOAD_DIR).
- [ ] Documenter flux d’auth et rôles.
- [ ] Captures d’écran ou GIF rapides du parcours (bonus).

---

## 11. Vérifications finales (à cocher)
- [ ] Création d’un **Individual** avec upload passeport → fiche → édition → suppression attachment OK.
- [ ] Création d’un **Phone Call** (sans passportNumber) acceptée et listée.
- [ ] Utilisateur **user** peut **voir** la liste et les fiches, **ne peut pas** créer/éditer/supprimer.
- [ ] Filtre liste par `status`, `type`, `search` fonctionne.
- [ ] Tous les endpoints documentés dans Swagger et répondent avec 2xx/4xx attendus.
