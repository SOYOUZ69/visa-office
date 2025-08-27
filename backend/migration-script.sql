-- Script de migration pour préserver les données existantes

-- 1. Créer les nouvelles tables pour le système de rôles
CREATE TABLE IF NOT EXISTS "roles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_key" ON "roles"("name");

CREATE TABLE IF NOT EXISTS "permissions" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "permissions_name_key" ON "permissions"("name");

CREATE TABLE IF NOT EXISTS "role_permissions" (
  "id" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  "grantedBy" TEXT,
  "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "role_permissions_roleId_permissionId_key" UNIQUE ("roleId", "permissionId")
);

CREATE TABLE IF NOT EXISTS "user_sessions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "employeeId" TEXT,
  "action" TEXT NOT NULL,
  "resourceType" TEXT,
  "resourceId" TEXT,
  "oldValues" JSONB,
  "newValues" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- 2. Insérer les rôles de base
INSERT INTO "roles" ("id", "name", "description", "isSystemRole", "isActive") VALUES 
('cldefault001', 'SUPER_ADMIN', 'Administrateur système avec tous les droits', true, true),
('cldefault002', 'LEGACY_ADMIN', 'Ancien rôle admin migré', false, true),
('cldefault003', 'LEGACY_USER', 'Ancien rôle user migré', false, true)
ON CONFLICT ("name") DO NOTHING;

-- 3. Insérer les permissions de base
INSERT INTO "permissions" ("id", "name", "module", "action", "description") VALUES 
-- Permissions système
('perm001', 'system.admin', 'system', 'admin', 'Administration système complète'),
-- Utilisateurs
('perm002', 'users.create', 'users', 'create', 'Créer des utilisateurs'),
('perm003', 'users.read', 'users', 'read', 'Consulter les utilisateurs'),
('perm004', 'users.update', 'users', 'update', 'Modifier les utilisateurs'),
('perm005', 'users.delete', 'users', 'delete', 'Supprimer les utilisateurs'),
-- Employés
('perm006', 'employees.create', 'employees', 'create', 'Créer des employés'),
('perm007', 'employees.read', 'employees', 'read', 'Consulter les employés'),
('perm008', 'employees.update', 'employees', 'update', 'Modifier les employés'),
('perm009', 'employees.delete', 'employees', 'delete', 'Supprimer les employés'),
-- Rôles
('perm010', 'roles.create', 'roles', 'create', 'Créer des rôles'),
('perm011', 'roles.read', 'roles', 'read', 'Consulter les rôles'),
('perm012', 'roles.update', 'roles', 'update', 'Modifier les rôles'),
('perm013', 'roles.delete', 'roles', 'delete', 'Supprimer les rôles'),
-- Clients
('perm014', 'clients.create', 'clients', 'create', 'Créer des clients'),
('perm015', 'clients.read', 'clients', 'read', 'Consulter les clients'),
('perm016', 'clients.update', 'clients', 'update', 'Modifier les clients'),
('perm017', 'clients.delete', 'clients', 'delete', 'Supprimer les clients'),
-- Financier
('perm018', 'financial.create', 'financial', 'create', 'Créer des transactions'),
('perm019', 'financial.read', 'financial', 'read', 'Consulter les données financières'),
('perm020', 'financial.update', 'financial', 'update', 'Modifier les données financières'),
('perm021', 'financial.approve', 'financial', 'approve', 'Approuver les transactions'),
-- Rapports
('perm022', 'reports.generate', 'reports', 'generate', 'Générer des rapports')
ON CONFLICT ("name") DO NOTHING;

-- 4. Assigner toutes les permissions au SUPER_ADMIN
INSERT INTO "role_permissions" ("id", "roleId", "permissionId")
SELECT 
  'rp_' || p."id",
  'cldefault001',
  p."id"
FROM "permissions" p
ON CONFLICT ("roleId", "permissionId") DO NOTHING;

-- 5. Ajouter les nouvelles colonnes aux utilisateurs
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "roleId" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- 6. Migrer les utilisateurs existants vers les nouveaux rôles
UPDATE "users" SET 
  "roleId" = CASE 
    WHEN "role" = 'ADMIN' THEN 'cldefault002'
    WHEN "role" = 'USER' THEN 'cldefault003'
    ELSE 'cldefault003'
  END
WHERE "roleId" IS NULL;

-- 7. Ajouter les nouvelles colonnes aux employés
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "hireDate" TIMESTAMP(3);
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- 8. Mettre à jour les types de données pour les employés
ALTER TABLE "employees" ALTER COLUMN "salaryAmount" TYPE DECIMAL(10,2);
ALTER TABLE "employees" ALTER COLUMN "soldeCoungiee" TYPE DECIMAL(10,2);
ALTER TABLE "employees" ALTER COLUMN "soldeCoungiee" SET DEFAULT 0;

-- 9. Ajouter les contraintes de clés étrangères
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" 
FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" 
FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" 
FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_grantedBy_fkey" 
FOREIGN KEY ("grantedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_employeeId_fkey" 
FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 10. Ajouter les contraintes d'unicité
CREATE UNIQUE INDEX IF NOT EXISTS "employees_email_key" ON "employees"("email") WHERE "email" IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "employees_userId_key" ON "employees"("userId") WHERE "userId" IS NOT NULL;

-- 11. Supprimer l'ancienne colonne role des users (après migration)
-- Cette étape sera faite après validation que tout fonctionne
-- ALTER TABLE "users" DROP COLUMN "role";

COMMIT;