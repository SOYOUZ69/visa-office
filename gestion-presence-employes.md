# Gestion de la Présence des Employés

## Vue d'ensemble

Le module de gestion de la présence des employés permet de suivre et gérer les présences, absences, congés et heures de travail du personnel. Il offre un système complet de contrôle des présences avec intégration dans le calcul des salaires.

## Types de Présence

### 1. Présent (PRESENT)

- **Présence normale** : Employé présent aux heures de travail
- **Heures complètes** : Respect des horaires de travail
- **Productivité** : Suivi de la productivité

### 2. Absent (ABSENT)

- **Absence non justifiée** : Absence sans autorisation
- **Impact salarial** : Déduction sur le salaire
- **Suivi** : Suivi des absences répétées

### 3. Retard (LATE)

- **Arrivée tardive** : Retard sur les horaires
- **Gestion** : Gestion des retards mineurs
- **Cumul** : Cumul des retards

### 4. Demi-journée (HALF_DAY)

- **Présence partielle** : Présence sur une partie de la journée
- **Justification** : Justification de l'absence partielle
- **Calcul** : Calcul proportionnel du salaire

## Structure des Données

### Modèle Présence

```typescript
interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  checkInTime?: string;
  checkOutTime?: string;
  hoursWorked?: number;
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    fullName: string;
  };
}
```

### Champs obligatoires

- **ID employé** : Référence vers l'employé
- **Date** : Date de la présence
- **Statut** : Statut de présence (PRESENT, ABSENT, LATE, HALF_DAY)

### Champs optionnels

- **Heure d'entrée** : Heure de début de travail
- **Heure de sortie** : Heure de fin de travail
- **Heures travaillées** : Nombre d'heures effectuées
- **Notes** : Commentaires ou justifications
- **Approuvé par** : Utilisateur ayant approuvé la présence

## Interface Utilisateur

### Composants principaux

#### 1. Calendrier de Présence

- **Vue mensuelle** : Calendrier avec statuts de présence
- **Vue hebdomadaire** : Vue détaillée de la semaine
- **Vue journalière** : Détail d'une journée spécifique
- **Couleurs** : Code couleur pour les différents statuts

#### 2. Formulaire de Saisie

```typescript
interface AttendanceFormData {
  employeeId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}
```

#### 3. Tableau de Bord

- **Vue d'ensemble** : Statistiques de présence
- **Alertes** : Absences non justifiées
- **Tendances** : Évolution des présences

### États et Interactions

#### États de présence

- **Enregistré** : Présence enregistrée
- **Validé** : Présence validée par un superviseur
- **Rejeté** : Présence rejetée avec motif
- **Modifié** : Présence modifiée après validation

#### Actions disponibles

- **Enregistrer** : Enregistrer une présence
- **Modifier** : Modifier une présence existante
- **Valider** : Valider une présence
- **Rejeter** : Rejeter une présence

## API Endpoints

### Gestion des présences

```typescript
// Récupérer les présences d'un employé
GET /api/v1/employees/:id/attendance?startDate=&endDate=

// Enregistrer une présence
POST /api/v1/employees/:id/attendance
{
  "date": "2024-01-15",
  "status": "PRESENT",
  "checkInTime": "09:00",
  "checkOutTime": "17:00",
  "notes": "Présence normale"
}

// Modifier une présence
PATCH /api/v1/employees/:id/attendance/:attendanceId
{
  "status": "LATE",
  "checkInTime": "09:30",
  "notes": "Retard de 30 minutes"
}
```

### Rapports et statistiques

```typescript
// Rapport de présence par employé
GET /api/v1/employees/:id/attendance-report?period=2024-01

// Rapport global de présence
GET /api/v1/employees/attendance-report?period=2024-01

// Statistiques de présence
GET /api/v1/employees/attendance-stats?period=2024-01
```

### Validation et approbation

```typescript
// Valider une présence
PATCH /api/v1/employees/:id/attendance/:attendanceId/approve

// Rejeter une présence
PATCH /api/v1/employees/:id/attendance/:attendanceId/reject
{
  "reason": "Heures non conformes"
}
```

## Calcul des Heures

### Heures de Travail

```typescript
// Calcul des heures travaillées
const calculateHoursWorked = (checkIn: string, checkOut: string) => {
  const start = new Date(`2024-01-01 ${checkIn}`);
  const end = new Date(`2024-01-01 ${checkOut}`);
  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60); // Conversion en heures
};
```

### Impact sur le Salaire

```typescript
// Calcul du salaire basé sur la présence
const calculateSalary = (baseSalary: number, attendance: Attendance[]) => {
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "PRESENT").length;
  const halfDays = attendance.filter((a) => a.status === "HALF_DAY").length;

  const salaryRatio = (presentDays + halfDays * 0.5) / totalDays;
  return baseSalary * salaryRatio;
};
```

## Intégration avec d'autres modules

### Module des Employés

- **Données de base** : Informations employé et horaires
- **Paramètres** : Horaires de travail et règles de présence
- **Historique** : Suivi des présences

### Module des Salaires

- **Calcul automatique** : Impact de la présence sur le salaire
- **Déductions** : Déductions pour absences
- **Bonus** : Bonus pour présence parfaite

### Module des Congés

- **Gestion des congés** : Intégration avec les congés payés
- **Validation** : Validation des congés
- **Calcul** : Calcul des indemnités de congés

## Workflow de Gestion

### Processus quotidien

1. **Enregistrement** : Enregistrement des présences
2. **Validation** : Validation par les superviseurs
3. **Calcul** : Calcul des heures travaillées
4. **Rapport** : Génération des rapports

### Processus mensuel

1. **Consolidation** : Consolidation des présences du mois
2. **Validation** : Validation finale des présences
3. **Calcul salarial** : Impact sur les salaires
4. **Rapport** : Génération du rapport mensuel

### Rôles et Responsabilités

- **Employé** : Enregistrement de sa propre présence
- **Superviseur** : Validation des présences de son équipe
- **Administrateur** : Gestion des exceptions et configurations

## Rapports et Analyses

### Rapports disponibles

- **Rapport de présence** : Présence par employé et par période
- **Rapport d'absences** : Analyse des absences
- **Rapport de retards** : Suivi des retards
- **Rapport de productivité** : Productivité basée sur la présence

### Métriques calculées

- **Taux de présence** : Pourcentage de présence
- **Taux d'absentéisme** : Pourcentage d'absences
- **Heures moyennes** : Heures moyennes travaillées
- **Retards** : Nombre et durée des retards

## Sécurité et Validation

### Contrôles de sécurité

- **Permissions** : Contrôle d'accès aux données de présence
- **Validation** : Validation des heures saisies
- **Audit** : Traçabilité des modifications

### Validation des données

- **Heures** : Vérification de la cohérence des heures
- **Dates** : Validation des dates de présence
- **Statuts** : Validation des statuts de présence

## Maintenance et Support

### Sauvegarde

- **Sauvegarde automatique** : Sauvegarde quotidienne des données
- **Récupération** : Procédures de restauration
- **Archivage** : Conservation de l'historique

### Performance

- **Optimisation** : Optimisation des requêtes
- **Cache** : Mise en cache des données fréquentes
- **Indexation** : Indexation des présences

## Utilisation Recommandée

### Bonnes pratiques

- **Saisie quotidienne** : Enregistrer les présences quotidiennement
- **Validation** : Valider les présences régulièrement
- **Communication** : Communiquer les règles de présence
- **Suivi** : Suivre les tendances de présence

### Fréquence de maintenance

- **Quotidienne** : Enregistrement des présences
- **Hebdomadaire** : Validation des présences
- **Mensuelle** : Génération des rapports
- **Trimestrielle** : Analyse des tendances

## Dépannage

### Problèmes courants

1. **Présence non enregistrée** : Vérifier les permissions
2. **Heures incorrectes** : Vérifier la saisie des heures
3. **Validation impossible** : Vérifier les droits d'accès

### Support technique

- Consulter les logs d'erreur
- Vérifier la configuration
- Contacter l'équipe technique si nécessaire
