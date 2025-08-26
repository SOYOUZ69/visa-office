# Traitement des Salaires et Commissions

## Vue d'ensemble

Le module de traitement des salaires et commissions automatise le processus de calcul, de validation et de paiement des rémunérations du personnel. Il gère les salaires fixes, les commissions variables et les avantages sociaux de manière centralisée et sécurisée.

## Types de Rémunération

### 1. Salaires Fixes

- **Salaire mensuel** : Montant fixe versé chaque mois
- **Salaire horaire** : Rémunération basée sur les heures travaillées
- **Salaire annuel** : Rémunération annuelle divisée en mensualités

### 2. Commissions Variables

- **Commission par client** : Pourcentage sur chaque dossier traité
- **Commission par période** : Pourcentage sur la performance de la période
- **Bonus de performance** : Récompenses pour objectifs dépassés

### 3. Avantages Sociaux

- **Congés payés** : Gestion des congés et indemnités
- **Assurance maladie** : Couverture médicale
- **Retraite** : Cotisations retraite
- **Autres avantages** : Tickets restaurant, transport, etc.

## Processus de Traitement

### 1. Collecte des Données

```typescript
interface PayrollData {
  employeeId: string;
  period: string;
  baseSalary: number;
  commissions: CommissionData[];
  deductions: DeductionData[];
  benefits: BenefitData[];
  attendance: AttendanceData;
}
```

### 2. Calcul Automatique

```typescript
// Calcul du salaire brut
const grossSalary = baseSalary + totalCommissions + totalBenefits;

// Calcul des déductions
const totalDeductions = taxes + socialSecurity + otherDeductions;

// Calcul du salaire net
const netSalary = grossSalary - totalDeductions;
```

### 3. Validation et Approbation

- **Vérification automatique** : Contrôle de cohérence des données
- **Validation manuelle** : Approbation par un superviseur
- **Corrections** : Possibilité de corrections avant paiement

### 4. Génération des Transactions

- **Création automatique** : Génération des transactions de paie
- **Intégration financière** : Mise à jour des comptes
- **Traçabilité** : Suivi complet des paiements

## Interface Utilisateur

### Composants principaux

#### 1. Tableau de Bord de Paie

```typescript
interface PayrollDashboard {
  totalEmployees: number;
  totalGrossSalary: number;
  totalNetSalary: number;
  totalCommissions: number;
  totalDeductions: number;
  pendingApprovals: number;
}
```

#### 2. Liste des Employés

- **Informations de base** : Nom, poste, type de contrat
- **Rémunération** : Salaire de base, commissions
- **Statut** : Actif, en congé, terminé
- **Actions** : Voir détails, Modifier, Calculer

#### 3. Formulaire de Calcul

```typescript
interface PayrollCalculationForm {
  period: string;
  employeeIds: string[];
  includeCommissions: boolean;
  includeBenefits: boolean;
  includeDeductions: boolean;
}
```

### États et Interactions

#### États de traitement

- **En cours** : Calcul en cours de traitement
- **Validé** : Calcul validé et approuvé
- **Payé** : Paiement effectué
- **Erreur** : Erreur dans le calcul

#### Actions disponibles

- **Calculer** : Lancer le calcul pour une période
- **Valider** : Approuver les calculs
- **Payer** : Effectuer les paiements
- **Exporter** : Exporter les données

## API Endpoints

### Calcul et traitement

```typescript
// Calculer les salaires pour une période
POST /api/v1/payroll/calculate
{
  "period": "2024-01",
  "employeeIds": ["emp1", "emp2"],
  "includeCommissions": true,
  "includeBenefits": true
}

// Valider les calculs
POST /api/v1/payroll/validate
{
  "calculationId": "calc_123",
  "approvedBy": "user_id"
}

// Effectuer les paiements
POST /api/v1/payroll/process-payments
{
  "calculationId": "calc_123",
  "paymentMethod": "BANK_TRANSFER"
}
```

### Récupération des données

```typescript
// Récupérer les calculs de paie
GET /api/v1/payroll/calculations?period=2024-01

// Récupérer un calcul spécifique
GET /api/v1/payroll/calculations/:id

// Récupérer l'historique des paiements
GET /api/v1/payroll/payment-history?employeeId=emp1
```

### Rapports

```typescript
// Rapport de paie par employé
GET /api/v1/payroll/employee-report/:id?period=2024-01

// Rapport global de paie
GET /api/v1/payroll/global-report?period=2024-01

// Export PDF du bulletin de paie
GET /api/v1/payroll/payslip/:id/download
```

## Calculs Détaillés

### Salaire de Base

```typescript
// Salaire mensuel fixe
const baseSalary = employee.salaryAmount;

// Salaire horaire
const baseSalary = hoursWorked * hourlyRate;

// Salaire avec primes
const baseSalary = employee.salaryAmount + bonuses;
```

### Commissions

```typescript
// Commission par client
const clientCommission = dossierAmount * (commissionRate / 100);

// Commission par période
const periodCommission = totalPerformance * (commissionRate / 100);

// Commission avec objectifs
const commission = baseCommission * (performanceRatio / 100);
```

### Déductions

```typescript
// Impôts sur le revenu
const incomeTax = grossSalary * (taxRate / 100);

// Sécurité sociale
const socialSecurity = grossSalary * (socialRate / 100);

// Autres déductions
const otherDeductions = insurance + retirement + other;
```

### Avantages

```typescript
// Indemnités de congés
const leaveAllowance = dailyRate * leaveDays;

// Avantages en nature
const benefitsInKind = transport + meals + housing;

// Bonus et primes
const bonuses = performanceBonus + seniorityBonus;
```

## Intégration avec d'autres modules

### Module des Employés

- **Données de base** : Informations employé et contrat
- **Paramètres** : Taux de commission et avantages
- **Historique** : Suivi des rémunérations

### Module des Commissions

- **Calcul automatique** : Intégration des commissions calculées
- **Validation** : Validation des commissions avant paiement
- **Historique** : Conservation de l'historique des commissions

### Module Financier

- **Transactions** : Création automatique des transactions de paie
- **Caisses** : Débit des caisses pour les paiements
- **Rapports** : Inclusion dans les rapports financiers

### Module de Présence

- **Heures travaillées** : Calcul basé sur la présence
- **Congés** : Gestion des congés et indemnités
- **Absences** : Impact sur le salaire

## Workflow de Traitement

### Processus Mensuel

1. **Collecte des données** : Récupération des données de base
2. **Calcul des commissions** : Calcul des commissions de la période
3. **Calcul des déductions** : Application des déductions légales
4. **Validation** : Vérification et approbation des calculs
5. **Génération des transactions** : Création des transactions de paie
6. **Paiement** : Exécution des paiements
7. **Archivage** : Conservation des données

### Rôles et Responsabilités

- **Système** : Calcul automatique et génération des transactions
- **Superviseur** : Validation et approbation des calculs
- **Administrateur** : Configuration et gestion des exceptions
- **Comptable** : Vérification et contrôle des paiements

## Rapports et Analyses

### Rapports disponibles

- **Bulletin de paie** : Détail complet de la rémunération
- **Rapport de paie** : Vue d'ensemble des salaires
- **Rapport de commissions** : Détail des commissions
- **Rapport de charges** : Analyse des charges sociales

### Métriques calculées

- **Coût total** : Coût total des rémunérations
- **Salaire moyen** : Salaire moyen par employé
- **Taux de commission** : Pourcentage de commissions dans la rémunération
- **Efficacité** : Coût par employé et par période

## Sécurité et Conformité

### Protection des données

- **Chiffrement** : Chiffrement des données sensibles
- **Accès contrôlé** : Restriction d'accès aux données de paie
- **Audit** : Traçabilité de toutes les actions

### Conformité légale

- **Réglementation** : Respect des lois du travail
- **Déclarations** : Génération des déclarations obligatoires
- **Archivage** : Conservation des documents légaux

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

- **Calcul régulier** : Effectuer les calculs à date fixe
- **Validation** : Valider tous les calculs avant paiement
- **Documentation** : Documenter les exceptions et corrections
- **Communication** : Informer les employés des changements

### Fréquence de traitement

- **Mensuelle** : Calcul et paiement des salaires
- **Trimestrielle** : Révision des commissions
- **Annuelle** : Calcul des bonus et ajustements

## Dépannage

### Problèmes courants

1. **Calcul incorrect** : Vérifier les données de base
2. **Commission manquante** : Vérifier les dossiers traités
3. **Paiement échoué** : Vérifier les informations bancaires

### Support technique

- Consulter les logs d'erreur
- Vérifier la configuration
- Contacter l'équipe technique si nécessaire
