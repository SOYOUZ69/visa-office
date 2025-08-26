# Gestion des Employés

## Vue d'ensemble

Le module de gestion des employés permet d'administrer le personnel du bureau de visa, incluant leurs informations personnelles, leurs contrats de travail, leurs salaires et leurs commissions. Il offre un système complet de suivi des ressources humaines.

## Types de Salaires

### 1. Salaire Mensuel (MONTHLY)

- **Salaire fixe** : Montant fixe versé chaque mois
- **Avantages sociaux** : Congés payés, assurance maladie
- **Stabilité** : Revenu prévisible et régulier

### 2. Commission par Client (CLIENTCOMMISSION)

- **Commission variable** : Pourcentage calculé sur chaque client traité
- **Motivation** : Incitation à traiter plus de dossiers
- **Flexibilité** : Revenu lié à la performance

### 3. Commission par Période (PERIODCOMMISSION)

- **Commission périodique** : Calculée sur une période donnée (mois, trimestre)
- **Objectifs** : Basée sur des objectifs de performance
- **Équilibre** : Entre stabilité et motivation

## Structure des Données

### Modèle Employé

```typescript
interface Employee {
  id: string;
  fullName: string;
  salaryType: "MONTHLY" | "CLIENTCOMMISSION" | "PERIODCOMMISSION";
  salaryAmount: number;
  commissionPercentage: string;
  soldeCoungiee: number;
  createdAt: string;
  updatedAt: string;
  calculatedCommission?: number;
}
```

### Champs obligatoires

- **Nom complet** : Nom et prénom de l'employé
- **Type de salaire** : Choix entre les trois types disponibles
- **Montant du salaire** : Salaire de base ou montant de référence
- **Pourcentage de commission** : Pourcentage appliqué pour les commissions

### Champs optionnels

- **Solde congé** : Nombre de jours de congé restants
- **Commission calculée** : Montant calculé automatiquement

## Interface Utilisateur

### Composants principaux

#### 1. Liste des Employés

- **Tableau** : Affichage de tous les employés
- **Tri** : Par nom, type de salaire, date de création
- **Filtres** : Par type de salaire, statut
- **Actions** : Voir, Modifier, Supprimer

#### 2. Formulaire de Création/Modification

```typescript
interface EmployeeFormData {
  fullName: string;
  salaryType: "MONTHLY" | "CLIENTCOMMISSION" | "PERIODCOMMISSION";
  salaryAmount: string;
  commissionPercentage: string;
  soldeCoungiee: string;
}
```

#### 3. Calcul de Commission

- **Calcul automatique** : Basé sur les dossiers traités
- **Affichage en temps réel** : Mise à jour automatique
- **Historique** : Suivi des commissions perçues

### États et Interactions

#### États de chargement

- **Chargement initial** : Affichage d'un spinner
- **Sauvegarde** : Indicateur de progression
- **Calcul** : Mise à jour des commissions

#### Validation des données

- **Nom** : Obligatoire, minimum 2 caractères
- **Salaire** : Doit être positif
- **Commission** : Doit être entre 0 et 100%
- **Congés** : Doit être positif ou nul

## API Endpoints

### Récupération des données

```typescript
// Récupérer tous les employés
GET /api/v1/employees

// Récupérer un employé spécifique
GET /api/v1/employees/:id

// Récupérer les employés avec filtres
GET /api/v1/employees?salaryType=MONTHLY&search=nom
```

### Création et modification

```typescript
// Créer un nouvel employé
POST /api/v1/employees
{
  "fullName": "Jean Dupont",
  "salaryType": "MONTHLY",
  "salaryAmount": 2500.00,
  "commissionPercentage": "0",
  "soldeCoungiee": 25
}

// Modifier un employé
PATCH /api/v1/employees/:id
{
  "salaryAmount": 2700.00,
  "soldeCoungiee": 23
}
```

### Calculs et rapports

```typescript
// Calculer la commission d'un employé
GET /api/v1/employees/:id/commission?period=2024-01

// Récupérer le rapport de paie
GET /api/v1/employees/:id/payroll?month=2024-01
```

## Gestion des Commissions

### Calcul des Commissions

#### Commission par Client

```typescript
// Calcul basé sur les dossiers traités
const commission = dossierAmount * (commissionPercentage / 100);
```

#### Commission par Période

```typescript
// Calcul basé sur la performance de la période
const commission = totalPerformance * (commissionPercentage / 100);
```

### Facteurs de calcul

- **Montant des dossiers** : Valeur des services traités
- **Nombre de clients** : Quantité de clients servis
- **Performance** : Objectifs atteints
- **Période** : Mois, trimestre, année

## Intégration avec d'autres modules

### Module des Dossiers

- **Attribution** : Assignation d'employés aux dossiers
- **Suivi** : Suivi de la progression des dossiers
- **Commission** : Calcul basé sur les dossiers traités

### Module des Paiements

- **Salaires** : Génération automatique des paiements de salaires
- **Commissions** : Paiement des commissions calculées
- **Avances** : Gestion des avances sur salaire

### Module Financier

- **Dépenses** : Les salaires apparaissent dans les dépenses
- **Transactions** : Création automatique des transactions de paie
- **Rapports** : Inclusion dans les rapports financiers

## Workflow de Gestion

### Processus d'embauche

1. **Création du profil** : Saisie des informations de base
2. **Configuration du contrat** : Type de salaire et montants
3. **Attribution des permissions** : Accès au système
4. **Formation** : Formation aux outils et procédures

### Processus de paie

1. **Calcul automatique** : Calcul des salaires et commissions
2. **Validation** : Vérification des montants
3. **Génération des transactions** : Création des transactions de paie
4. **Paiement** : Exécution des paiements

### Processus de congés

1. **Demande** : L'employé demande des congés
2. **Validation** : Approbation par le superviseur
3. **Mise à jour** : Mise à jour du solde de congés
4. **Suivi** : Suivi de l'utilisation des congés

## Rapports et Analyses

### Rapports disponibles

- **Liste des employés** : Tous les employés avec leurs informations
- **Rapport de paie** : Salaires et commissions par période
- **Rapport de performance** : Performance et commissions
- **Rapport de congés** : Utilisation des congés

### Métriques calculées

- **Coût total** : Somme des salaires et commissions
- **Performance moyenne** : Performance moyenne des employés
- **Taux de rotation** : Taux de turnover du personnel
- **Productivité** : Productivité par employé

## Sécurité et Permissions

### Rôles et accès

- **ADMIN** : Accès complet à toutes les fonctionnalités
- **MANAGER** : Gestion des employés de son équipe
- **EMPLOYEE** : Accès à ses propres informations

### Protection des données

- **Chiffrement** : Chiffrement des données sensibles
- **Audit** : Logs de toutes les actions
- **Backup** : Sauvegarde régulière des données

## Maintenance et Support

### Sauvegarde

- **Sauvegarde automatique** : Sauvegarde quotidienne
- **Récupération** : Procédures de restauration
- **Archivage** : Conservation des anciens employés

### Performance

- **Indexation** : Optimisation des requêtes
- **Cache** : Mise en cache des données fréquentes
- **Pagination** : Chargement progressif

## Utilisation Recommandée

### Bonnes pratiques

- **Mise à jour régulière** : Maintenir les informations à jour
- **Validation des données** : Vérifier l'exactitude des informations
- **Suivi des performances** : Suivre régulièrement les performances
- **Communication** : Informer les employés des changements

### Fréquence de maintenance

- **Quotidienne** : Vérification des nouvelles entrées
- **Hebdomadaire** : Calcul des commissions
- **Mensuelle** : Génération des rapports de paie
- **Trimestrielle** : Évaluation des performances

## Dépannage

### Problèmes courants

1. **Commission non calculée** : Vérifier les dossiers attribués
2. **Salaire incorrect** : Vérifier les paramètres de calcul
3. **Accès refusé** : Vérifier les permissions utilisateur

### Support technique

- Consulter les logs d'erreur
- Vérifier la configuration
- Contacter l'équipe technique si nécessaire
