# Gestion des Caisses

## Vue d'ensemble

Le module de gestion des caisses permet d'administrer les différents comptes de trésorerie du bureau de visa, incluant les caisses physiques, les comptes bancaires et les caisses virtuelles. Il offre un contrôle centralisé de tous les flux de trésorerie.

## Types de Caisses

### 1. Caisse Physique (CASH)

- **Espèces** : Gestion des fonds en espèces
- **Chèques** : Traitement des chèques reçus
- **Contrôle** : Suivi des mouvements physiques
- **Sécurité** : Contrôles de sécurité renforcés

### 2. Compte Bancaire (BANK_ACCOUNT)

- **Comptes courants** : Gestion des comptes bancaires
- **Virements** : Traitement des virements bancaires
- **Relevés** : Import et réconciliation des relevés
- **Synchronisation** : Synchronisation avec les banques

### 3. Caisse Virtuelle (VIRTUAL)

- **Comptes internes** : Comptes de gestion interne
- **Fonds dédiés** : Fonds réservés à des usages spécifiques
- **Suivi** : Suivi des mouvements internes
- **Flexibilité** : Adaptation aux besoins métier

## Structure des Données

### Modèle Caisse

```typescript
interface Caisse {
  id: string;
  name: string;
  type: "VIRTUAL" | "CASH" | "BANK_ACCOUNT";
  balance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Champs obligatoires

- **Nom** : Nom de la caisse
- **Type** : Type de caisse (VIRTUAL, CASH, BANK_ACCOUNT)
- **Solde** : Solde actuel de la caisse
- **Statut** : Actif ou inactif

### Champs optionnels

- **Description** : Description détaillée de la caisse
- **Paramètres** : Paramètres spécifiques au type de caisse

## Interface Utilisateur

### Composants principaux

#### 1. Liste des Caisses

- **Tableau** : Affichage de toutes les caisses
- **Filtres** : Par type, statut, solde
- **Tri** : Par nom, type, solde
- **Actions** : Voir, Modifier, Supprimer

#### 2. Formulaire de Création/Modification

```typescript
interface CaisseFormData {
  name: string;
  type: "VIRTUAL" | "CASH" | "BANK_ACCOUNT";
  description: string;
  initialBalance?: number;
}
```

#### 3. Tableau de Bord

- **Vue d'ensemble** : Total des soldes par type
- **Mouvements** : Derniers mouvements de trésorerie
- **Alertes** : Alertes de solde faible ou négatif

### États et Interactions

#### États de caisse

- **Active** : Caisse en service
- **Inactive** : Caisse désactivée
- **En maintenance** : Caisse temporairement indisponible

#### Actions disponibles

- **Créer** : Créer une nouvelle caisse
- **Modifier** : Modifier les paramètres
- **Activer/Désactiver** : Changer le statut
- **Supprimer** : Supprimer la caisse (si vide)

## API Endpoints

### Gestion des caisses

```typescript
// Récupérer toutes les caisses
GET /api/v1/financial/caisses

// Récupérer une caisse spécifique
GET /api/v1/financial/caisses/:id

// Créer une nouvelle caisse
POST /api/v1/financial/caisses
{
  "name": "Caisse Principale",
  "type": "CASH",
  "description": "Caisse principale pour les paiements en espèces",
  "initialBalance": 1000.00
}

// Modifier une caisse
PATCH /api/v1/financial/caisses/:id
{
  "name": "Caisse Principale - Mise à jour",
  "description": "Description mise à jour"
}
```

### Opérations sur les caisses

```typescript
// Récupérer le solde d'une caisse
GET /api/v1/financial/caisses/:id/balance

// Effectuer un mouvement
POST /api/v1/financial/caisses/:id/movements
{
  "type": "INCOME",
  "amount": 500.00,
  "description": "Paiement client",
  "reference": "PAY-2024-001"
}

// Récupérer l'historique des mouvements
GET /api/v1/financial/caisses/:id/movements?startDate=&endDate=
```

### Rapports

```typescript
// Rapport de trésorerie
GET /api/v1/financial/caisses/report?period=2024-01

// Export des mouvements
GET /api/v1/financial/caisses/:id/export?format=csv&period=2024-01
```

## Gestion des Mouvements

### Types de Mouvements

- **Revenus** : Entrées d'argent (paiements clients, etc.)
- **Dépenses** : Sorties d'argent (achats, salaires, etc.)
- **Transferts** : Mouvements entre caisses

### Validation des Mouvements

```typescript
// Vérification du solde disponible
const canProcessMovement = (caisseId: string, amount: number, type: string) => {
  const caisse = getCaisse(caisseId);
  if (type === "EXPENSE" || type === "TRANSFER") {
    return caisse.balance >= amount;
  }
  return true;
};
```

### Traçabilité

- **Horodatage** : Date et heure de chaque mouvement
- **Utilisateur** : Identification de l'utilisateur responsable
- **Référence** : Référence unique pour chaque mouvement
- **Description** : Description détaillée du mouvement

## Intégration avec d'autres modules

### Module des Transactions

- **Création automatique** : Les transactions mettent à jour les soldes
- **Validation** : Vérification de la disponibilité des fonds
- **Historique** : Conservation de l'historique des mouvements

### Module des Paiements

- **Réception** : Les paiements clients sont reçus sur les caisses
- **Attribution** : Attribution automatique ou manuelle des caisses
- **Suivi** : Suivi des paiements par caisse

### Module Financier

- **Soldes** : Affichage des soldes dans les rapports
- **Mouvements** : Intégration des mouvements dans les analyses
- **Rapports** : Inclusion dans les rapports financiers

## Sécurité et Contrôles

### Contrôles de sécurité

- **Permissions** : Contrôle d'accès aux caisses
- **Validation** : Validation des mouvements importants
- **Audit** : Traçabilité de toutes les opérations

### Contrôles de cohérence

- **Solde** : Vérification de la cohérence des soldes
- **Mouvements** : Validation des mouvements
- **Réconciliation** : Réconciliation avec les relevés bancaires

## Rapports et Analyses

### Rapports disponibles

- **État des caisses** : Solde de toutes les caisses
- **Mouvements par caisse** : Historique des mouvements
- **Rapport de trésorerie** : Vue d'ensemble de la trésorerie
- **Réconciliation bancaire** : Comparaison avec les relevés

### Métriques calculées

- **Total des soldes** : Somme des soldes de toutes les caisses
- **Mouvements journaliers** : Volume des mouvements par jour
- **Répartition** : Répartition des fonds par type de caisse
- **Tendances** : Évolution des soldes dans le temps

## Workflow de Gestion

### Processus de création

1. **Définition** : Définition des paramètres de la caisse
2. **Création** : Création de la caisse dans le système
3. **Configuration** : Configuration des paramètres spécifiques
4. **Activation** : Activation de la caisse
5. **Formation** : Formation des utilisateurs

### Processus de clôture

1. **Vérification** : Vérification du solde et des mouvements
2. **Validation** : Validation de la clôture
3. **Archivage** : Archivage des données
4. **Désactivation** : Désactivation de la caisse

## Maintenance et Support

### Sauvegarde

- **Sauvegarde automatique** : Sauvegarde quotidienne des données
- **Récupération** : Procédures de restauration
- **Archivage** : Conservation de l'historique

### Performance

- **Optimisation** : Optimisation des requêtes
- **Cache** : Mise en cache des soldes
- **Indexation** : Indexation des mouvements

## Utilisation Recommandée

### Bonnes pratiques

- **Séparation** : Séparer les caisses par usage
- **Contrôle** : Contrôler régulièrement les soldes
- **Réconciliation** : Réconcilier avec les relevés bancaires
- **Documentation** : Documenter les procédures

### Fréquence de maintenance

- **Quotidienne** : Vérification des soldes
- **Hebdomadaire** : Réconciliation des mouvements
- **Mensuelle** : Génération des rapports
- **Trimestrielle** : Audit des caisses

## Dépannage

### Problèmes courants

1. **Solde incorrect** : Vérifier les mouvements récents
2. **Mouvement rejeté** : Vérifier la disponibilité des fonds
3. **Caisse inaccessible** : Vérifier les permissions

### Support technique

- Consulter les logs d'erreur
- Vérifier la configuration
- Contacter l'équipe technique si nécessaire
