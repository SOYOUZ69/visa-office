# Gestion des Transactions

## Vue d'ensemble

Le module de gestion des transactions permet de suivre et gérer tous les mouvements financiers du bureau de visa. Il englobe les revenus, les dépenses et les transferts entre caisses, offrant une traçabilité complète des flux de trésorerie.

## Types de Transactions

### 1. Revenus (INCOME)

- **Paiements clients** : Versements pour les services de visa
- **Commissions** : Commissions perçues sur les dossiers
- **Autres revenus** : Revenus divers de l'entreprise

### 2. Dépenses (EXPENSE)

- **Salaires** : Rémunérations des employés
- **Loyer de bureau** : Charges locatives
- **Fournitures** : Matériel de bureau
- **Services publics** : Électricité, eau, internet
- **Assurance** : Polices d'assurance
- **Frais juridiques** : Honoraires d'avocats
- **Marketing** : Dépenses publicitaires
- **Voyages** : Frais de déplacement
- **Autres** : Dépenses diverses

### 3. Transferts (TRANSFER)

- **Entre caisses** : Mouvements entre différentes caisses
- **Vers comptes bancaires** : Transferts vers des comptes externes

## Statuts des Transactions

### 1. En attente (PENDING)

- Transaction créée mais non encore traitée
- Nécessite une validation ou approbation

### 2. Approuvée (APPROVED)

- Transaction validée et autorisée
- Prête à être exécutée

### 3. Rejetée (REJECTED)

- Transaction refusée
- Raison du rejet enregistrée

### 4. Terminée (COMPLETED)

- Transaction exécutée avec succès
- Montant débité/crédité sur la caisse

### 5. Annulée (CANCELLED)

- Transaction annulée
- Aucun impact sur les soldes

## Interface Utilisateur

### Composants principaux

#### 1. Liste des Transactions

```typescript
interface Transaction {
  id: string;
  caisseId: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: string;
  amount: number;
  description: string;
  reference?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED" | "CANCELLED";
  transactionDate: string;
  caisse: {
    name: string;
    type: string;
  };
  payment?: {
    client: {
      fullName: string;
    };
  };
}
```

#### 2. Filtres et Recherche

- **Par type** : Revenus, Dépenses, Transferts
- **Par statut** : Tous les statuts disponibles
- **Par caisse** : Sélection de la caisse source
- **Par période** : Plage de dates
- **Par montant** : Fourchette de montants
- **Recherche textuelle** : Description, référence

#### 3. Actions sur les Transactions

- **Voir les détails** : Affichage complet des informations
- **Modifier** : Édition des champs autorisés
- **Approuver/Rejeter** : Changement de statut
- **Supprimer** : Suppression (si autorisée)

### Création de Transactions

#### Formulaire de création

```typescript
interface CreateTransactionDto {
  caisseId: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: string;
  amount: number;
  description: string;
  reference?: string;
  transactionDate?: string;
}
```

#### Validation des données

- **Montant** : Doit être positif et non nul
- **Caisse** : Doit exister et être active
- **Description** : Obligatoire, minimum 3 caractères
- **Date** : Doit être dans le passé ou aujourd'hui

## API Endpoints

### Récupération des données

```typescript
// Récupérer toutes les transactions
GET /api/v1/financial/transactions

// Récupérer une transaction spécifique
GET /api/v1/financial/transactions/:id

// Récupérer les transactions avec filtres
GET /api/v1/financial/transactions?type=EXPENSE&status=PENDING&caisseId=123
```

### Création et modification

```typescript
// Créer une nouvelle transaction
POST /api/v1/financial/transactions
{
  "caisseId": "caisse_id",
  "type": "EXPENSE",
  "category": "OFFICE_SUPPLIES",
  "amount": 150.00,
  "description": "Achat fournitures de bureau",
  "reference": "FACT-2024-001"
}

// Modifier une transaction
PATCH /api/v1/financial/transactions/:id
{
  "amount": 175.00,
  "description": "Achat fournitures de bureau - mise à jour"
}
```

### Gestion des statuts

```typescript
// Approuver une transaction
PATCH /api/v1/financial/transactions/:id/approve

// Rejeter une transaction
PATCH /api/v1/financial/transactions/:id/reject
{
  "reason": "Montant incorrect"
}

// Marquer comme terminée
PATCH /api/v1/financial/transactions/:id/complete
```

## Catégories de Dépenses

### Énumération des catégories

```typescript
enum ExpenseCategory {
  OFFICE_RENT = "Loyer de bureau",
  UTILITIES = "Services publics",
  SALARIES = "Salaires",
  OFFICE_SUPPLIES = "Fournitures de bureau",
  INSURANCE = "Assurance",
  LEGAL_FEES = "Frais juridiques",
  MARKETING = "Marketing",
  TRAVEL = "Voyages",
  OTHER = "Autres",
}
```

### Utilisation des catégories

- **Filtrage** : Recherche par catégorie
- **Rapports** : Groupement dans les analyses
- **Budgets** : Suivi par catégorie
- **Statistiques** : Analyse des dépenses

## Intégration avec d'autres modules

### Module des Paiements

- **Création automatique** : Les paiements clients génèrent des transactions de revenus
- **Liaison** : Chaque transaction peut être liée à un paiement spécifique
- **Traçabilité** : Suivi complet du flux de paiement

### Module des Caisses

- **Impact sur les soldes** : Mise à jour automatique des soldes des caisses
- **Validation** : Vérification de la disponibilité des fonds
- **Historique** : Conservation de l'historique des mouvements

### Module des Employés

- **Salaires** : Génération automatique des transactions de salaires
- **Commissions** : Création des transactions de commissions
- **Avances** : Gestion des avances sur salaire

## Workflow d'Approbation

### Processus standard

1. **Création** : Un utilisateur crée une transaction
2. **Soumission** : La transaction est soumise pour approbation
3. **Révision** : Un superviseur examine la transaction
4. **Décision** : Approbation ou rejet
5. **Exécution** : Si approuvée, la transaction est exécutée

### Rôles et permissions

- **Créateur** : Peut créer et modifier ses transactions
- **Superviseur** : Peut approuver/rejeter les transactions
- **Administrateur** : Accès complet à toutes les transactions

## Rapports et Analyses

### Rapports disponibles

- **Journal des transactions** : Liste chronologique de toutes les transactions
- **Rapport par caisse** : Mouvements par caisse
- **Rapport par catégorie** : Dépenses groupées par catégorie
- **Rapport de trésorerie** : Évolution des soldes

### Métriques calculées

- **Total des revenus** : Somme de toutes les entrées
- **Total des dépenses** : Somme de toutes les sorties
- **Solde net** : Différence entre revenus et dépenses
- **Tendances** : Évolution dans le temps

## Sécurité et Audit

### Traçabilité

- **Logs d'audit** : Enregistrement de toutes les actions
- **Historique des modifications** : Suivi des changements
- **Horodatage** : Date et heure de chaque action
- **Utilisateur** : Identification de l'utilisateur responsable

### Validation

- **Contrôles d'intégrité** : Vérification de la cohérence des données
- **Validation des montants** : Contrôle des valeurs numériques
- **Vérification des permissions** : Contrôle d'accès

## Maintenance et Support

### Sauvegarde

- **Sauvegarde automatique** : Sauvegarde quotidienne des données
- **Récupération** : Procédures de restauration en cas de problème
- **Archivage** : Conservation des anciennes transactions

### Performance

- **Indexation** : Optimisation des requêtes de base de données
- **Pagination** : Chargement progressif des données
- **Cache** : Mise en cache des données fréquemment consultées

## Utilisation Recommandée

### Bonnes pratiques

- **Saisie immédiate** : Enregistrer les transactions dès qu'elles se produisent
- **Descriptions claires** : Utiliser des descriptions précises et détaillées
- **Références** : Inclure des références pour faciliter le suivi
- **Catégorisation** : Utiliser les catégories appropriées

### Fréquence de consultation

- **Quotidienne** : Vérification des transactions du jour
- **Hebdomadaire** : Révision des transactions en attente
- **Mensuelle** : Analyse des tendances et génération de rapports

## Dépannage

### Problèmes courants

1. **Transaction non enregistrée** : Vérifier la connexion et les permissions
2. **Solde incorrect** : Vérifier l'intégrité des transactions
3. **Approbation impossible** : Vérifier les permissions utilisateur

### Support technique

- Consulter les logs d'erreur
- Vérifier la configuration de la base de données
- Contacter l'équipe technique si nécessaire
