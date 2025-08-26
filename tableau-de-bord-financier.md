# Tableau de Bord Financier

## Vue d'ensemble

Le tableau de bord financier est un module central du système de gestion du bureau de visa qui fournit une vue complète et en temps réel de la situation financière de l'entreprise. Il permet aux administrateurs et aux gestionnaires de suivre les revenus, les dépenses, les profits et les flux de trésorerie.

## Fonctionnalités principales

### 1. Statistiques Financières

- **Revenus totaux** : Affichage des revenus générés sur une période donnée
- **Dépenses totales** : Suivi de toutes les dépenses de l'entreprise
- **Bénéfice net** : Calcul automatique du profit après déduction des dépenses
- **Taxes** : Gestion des obligations fiscales
- **Marge bénéficiaire** : Calcul du pourcentage de profit

### 2. Gestion des Périodes

- **Périodes prédéfinies** : Mois en cours, trimestre, année
- **Périodes personnalisées** : Sélection de dates de début et de fin personnalisées
- **Comparaisons** : Possibilité de comparer les performances entre différentes périodes

### 3. Rapports Financiers

- **Génération automatique** : Création de rapports financiers détaillés
- **Export PDF** : Téléchargement des rapports au format PDF (à faire)
- **Historique** : Conservation de tous les rapports générés
- **Métadonnées** : Informations sur la période, les totaux et les soldes des caisses

### 4. Visualisation des Données

- **Graphiques** : Représentations visuelles des tendances financières
- **Indicateurs** : Badges colorés pour les statuts (en hausse, en baisse, stable)
- **Tableaux** : Données structurées avec tri et filtrage

## Interface Utilisateur

### Composants principaux

#### 1. Cartes de Statistiques

```typescript
interface FinancialStatistics {
  totalIncome: number;
  totalExpenses: number;
  totalTax: number;
  netProfit: number;
  profitMargin: number;
}
```

#### 2. Sélecteur de Période

- Boutons pour les périodes rapides (mois, trimestre, année)
- Sélecteur de dates personnalisées
- Validation des plages de dates

#### 3. Tableau des Rapports

- Liste des rapports générés
- Actions : Voir, Télécharger, Supprimer
- Informations : Date, période, totaux

### États et Interactions

#### États de chargement

- **Chargement initial** : Affichage d'un spinner pendant le chargement des données
- **Génération de rapport** : Indicateur de progression pendant la génération
- **Export** : Téléchargement en cours

#### Gestion des erreurs

- Messages d'erreur pour les échecs de chargement
- Validation des données saisies
- Retry automatique en cas d'échec réseau

## API Endpoints

### Récupération des données

```typescript
// Récupérer les rapports financiers
GET /api/v1/financial/reports

// Récupérer les statistiques pour une période
GET /api/v1/financial/statistics?startDate=&endDate=

// Récupérer les caisses
GET /api/v1/financial/caisses
```

### Génération de rapports

```typescript
// Générer un nouveau rapport
POST /api/v1/financial/reports
{
  "periodStart": "2024-01-01",
  "periodEnd": "2024-01-31",
  "includeStatistics": true
}
```

### Export

```typescript
// Télécharger un rapport en PDF
GET /api/v1/financial/reports/:id/download
```

## Modèles de Données

### Rapport Financier

```typescript
interface FinancialReport {
  id: string;
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpenses: number;
  totalTax: number;
  netProfit: number;
  caisseBalances: Record<string, any>;
}
```

### Statistiques Financières

```typescript
interface FinancialStatistics {
  totalIncome: number;
  totalExpenses: number;
  totalTax: number;
  netProfit: number;
  profitMargin: number;
  incomeTrend: "up" | "down" | "stable";
  expenseTrend: "up" | "down" | "stable";
}
```

## Sécurité et Permissions

### Rôles requis

- **ADMIN** : Accès complet à toutes les fonctionnalités
- **USER** : Accès en lecture seule aux statistiques publiques

### Validation des données

- Vérification des permissions avant affichage
- Validation des plages de dates
- Protection contre les injections SQL

## Intégration avec d'autres modules

### Module des Transactions

- Les transactions sont automatiquement incluses dans les calculs
- Mise à jour en temps réel des statistiques

### Module des Caisses

- Affichage des soldes des caisses dans les rapports
- Intégration des mouvements de trésorerie

### Module des Employés

- Inclusion des salaires dans les dépenses
- Calcul des commissions dans les revenus

## Maintenance et Support

### Sauvegarde des données

- Sauvegarde automatique des rapports générés
- Conservation de l'historique des statistiques

### Performance

- Mise en cache des données fréquemment consultées
- Optimisation des requêtes de base de données
- Pagination pour les grandes quantités de données

### Monitoring

- Logs des actions importantes
- Alertes en cas d'anomalies
- Métriques de performance

## Utilisation Recommandée

### Fréquence de consultation

- **Quotidienne** : Vérification des transactions du jour
- **Hebdomadaire** : Analyse des tendances
- **Mensuelle** : Génération de rapports complets

### Bonnes pratiques

- Générer des rapports réguliers
- Comparer les performances entre périodes
- Analyser les tendances pour la prise de décision
- Sauvegarder les rapports importants

## Dépannage

### Problèmes courants

1. **Données non mises à jour** : Vérifier la connexion à la base de données
2. **Erreurs de calcul** : Vérifier l'intégrité des transactions
3. **Problèmes d'export** : Vérifier les permissions de fichier

### Support technique

- Consulter les logs d'erreur
- Vérifier la configuration de la base de données
- Contacter l'équipe technique en cas de problème persistant
