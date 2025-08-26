# Gestion des Commissions

## Vue d'ensemble

Le module de gestion des commissions permet de calculer, suivre et gérer les commissions des employés basées sur leur performance et les dossiers traités. Il offre un système transparent et automatisé pour la rémunération variable du personnel.

## Types de Commissions

### 1. Commission par Client (CLIENTCOMMISSION)

- **Calcul individuel** : Commission calculée sur chaque client traité
- **Motivation immédiate** : Incitation à traiter plus de dossiers
- **Transparence** : Commission visible immédiatement après traitement

### 2. Commission par Période (PERIODCOMMISSION)

- **Calcul périodique** : Commission calculée sur une période donnée
- **Objectifs** : Basée sur des objectifs de performance définis
- **Équilibre** : Entre stabilité et motivation

## Structure des Données

### Modèle Commission

```typescript
interface EmployeeCommission {
  id: string;
  employeeId: string;
  dossierId: string;
  paymentId: string;
  amount: number;
  percentage: number;
  calculatedAt: string;
  status: "PENDING" | "APPROVED" | "PAID";
  employee: {
    id: string;
    fullName: string;
    commissionPercentage: string;
  };
  dossier: {
    id: string;
    client: {
      fullName: string;
    };
  };
  payment: {
    id: string;
    totalAmount: number;
  };
}
```

### Champs obligatoires

- **ID employé** : Référence vers l'employé
- **ID dossier** : Référence vers le dossier traité
- **ID paiement** : Référence vers le paiement associé
- **Montant** : Montant de la commission calculée
- **Pourcentage** : Pourcentage appliqué

### Champs optionnels

- **Date de calcul** : Date de calcul de la commission
- **Statut** : Statut de la commission (en attente, approuvée, payée)

## Calcul des Commissions

### Formule de Base

```typescript
// Commission par client
const commission = dossierAmount * (commissionPercentage / 100);

// Commission par période
const commission = totalPerformance * (commissionPercentage / 100);
```

### Facteurs de Calcul

#### 1. Montant du Dossier

- **Valeur des services** : Total des services fournis
- **Paiements reçus** : Montants effectivement payés
- **Pénalités** : Déductions pour retards ou erreurs

#### 2. Pourcentage de Commission

- **Taux de base** : Pourcentage standard défini dans le contrat
- **Bonus** : Pourcentages supplémentaires pour performance exceptionnelle
- **Pénalités** : Réductions pour objectifs non atteints

#### 3. Période de Calcul

- **Mensuelle** : Calcul mensuel des commissions
- **Trimestrielle** : Calcul trimestriel avec objectifs
- **Annuelle** : Calcul annuel avec bonus

## Interface Utilisateur

### Composants principaux

#### 1. Liste des Commissions

- **Tableau** : Affichage de toutes les commissions
- **Filtres** : Par employé, période, statut
- **Tri** : Par date, montant, employé
- **Actions** : Voir, Approuver, Payer

#### 2. Calcul Automatique

- **Déclenchement** : Calcul automatique lors du traitement des dossiers
- **Validation** : Vérification des montants calculés
- **Notification** : Notification aux employés concernés

#### 3. Tableau de Bord

- **Vue d'ensemble** : Total des commissions par période
- **Performance** : Comparaison des performances entre employés
- **Tendances** : Évolution des commissions dans le temps

### États et Interactions

#### États de commission

- **En attente** : Commission calculée mais non encore approuvée
- **Approuvée** : Commission validée et prête à être payée
- **Payée** : Commission versée à l'employé

#### Actions disponibles

- **Calculer** : Calcul manuel d'une commission
- **Approuver** : Validation d'une commission
- **Rejeter** : Refus d'une commission avec motif
- **Payer** : Marquer comme payée

## API Endpoints

### Récupération des données

```typescript
// Récupérer toutes les commissions
GET /api/v1/employees/commissions

// Récupérer les commissions d'un employé
GET /api/v1/employees/:id/commissions

// Récupérer les commissions avec filtres
GET /api/v1/employees/commissions?status=PENDING&period=2024-01
```

### Calcul et gestion

```typescript
// Calculer les commissions pour une période
POST /api/v1/employees/commissions/calculate
{
  "period": "2024-01",
  "employeeIds": ["emp1", "emp2"]
}

// Approuver une commission
PATCH /api/v1/employees/commissions/:id/approve

// Marquer comme payée
PATCH /api/v1/employees/commissions/:id/pay
```

### Rapports

```typescript
// Rapport de commissions par employé
GET /api/v1/employees/:id/commission-report?period=2024-01

// Rapport global des commissions
GET /api/v1/employees/commissions/report?period=2024-01
```

## Workflow de Gestion

### Processus de Calcul

1. **Traitement du dossier** : L'employé traite un dossier client
2. **Paiement reçu** : Le paiement est enregistré dans le système
3. **Calcul automatique** : La commission est calculée automatiquement
4. **Validation** : La commission est soumise pour validation
5. **Approbation** : Un superviseur approuve la commission
6. **Paiement** : La commission est versée à l'employé

### Rôles et Responsabilités

- **Employé** : Traite les dossiers et génère les commissions
- **Superviseur** : Valide et approuve les commissions
- **Administrateur** : Configure les paramètres et gère les exceptions

## Intégration avec d'autres modules

### Module des Dossiers

- **Attribution** : Lien entre employé et dossier
- **Suivi** : Suivi de la progression du dossier
- **Validation** : Validation du traitement du dossier

### Module des Paiements

- **Déclenchement** : Le paiement déclenche le calcul de commission
- **Montant** : Le montant de la commission est basé sur le paiement
- **Statut** : Le statut du paiement affecte la commission

### Module Financier

- **Dépenses** : Les commissions apparaissent dans les dépenses
- **Transactions** : Création de transactions pour les commissions
- **Rapports** : Inclusion dans les rapports financiers

## Rapports et Analyses

### Rapports disponibles

- **Rapport par employé** : Commissions individuelles par période
- **Rapport global** : Vue d'ensemble de toutes les commissions
- **Rapport de performance** : Performance et commissions par employé
- **Rapport de tendances** : Évolution des commissions dans le temps

### Métriques calculées

- **Total des commissions** : Somme de toutes les commissions
- **Commission moyenne** : Commission moyenne par employé
- **Performance** : Taux de conversion des dossiers
- **Efficacité** : Commissions par heure travaillée

## Sécurité et Validation

### Contrôles de sécurité

- **Permissions** : Vérification des droits d'accès
- **Validation** : Contrôle de la cohérence des données
- **Audit** : Traçabilité de toutes les actions

### Validation des données

- **Montants** : Vérification des montants calculés
- **Pourcentages** : Validation des pourcentages appliqués
- **Périodes** : Contrôle des périodes de calcul

## Maintenance et Support

### Sauvegarde

- **Sauvegarde automatique** : Sauvegarde quotidienne des données
- **Récupération** : Procédures de restauration
- **Archivage** : Conservation de l'historique

### Performance

- **Optimisation** : Optimisation des calculs
- **Cache** : Mise en cache des résultats
- **Indexation** : Indexation des requêtes fréquentes

## Utilisation Recommandée

### Bonnes pratiques

- **Calcul régulier** : Calculer les commissions régulièrement
- **Validation** : Valider les commissions avant paiement
- **Communication** : Informer les employés des changements
- **Suivi** : Suivre les performances et ajuster si nécessaire

### Fréquence de maintenance

- **Quotidienne** : Calcul des commissions du jour
- **Hebdomadaire** : Validation des commissions
- **Mensuelle** : Génération des rapports
- **Trimestrielle** : Évaluation des performances

## Dépannage

### Problèmes courants

1. **Commission non calculée** : Vérifier les dossiers attribués
2. **Montant incorrect** : Vérifier les paramètres de calcul
3. **Validation impossible** : Vérifier les permissions

### Support technique

- Consulter les logs d'erreur
- Vérifier la configuration
- Contacter l'équipe technique si nécessaire
