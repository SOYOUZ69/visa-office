-- Nouveau schéma pour système de rôles dynamique

-- Table des rôles (créés par l'admin)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- true pour SUPER_ADMIN (non supprimable)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des permissions disponibles dans le système
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- Ex: 'clients.create', 'employees.read', 'users.delete'
  module VARCHAR(50) NOT NULL,        -- Ex: 'clients', 'employees', 'users', 'financial'
  action VARCHAR(20) NOT NULL,        -- Ex: 'create', 'read', 'update', 'delete', 'manage'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table de liaison rôles-permissions (Many-to-Many)
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id), -- Qui a donné cette permission
  granted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Mise à jour table Users
ALTER TABLE users ADD COLUMN role_id UUID REFERENCES roles(id);
ALTER TABLE users DROP COLUMN role; -- Supprimer l'ancien enum

-- Mise à jour table Employee avec lien vers User
ALTER TABLE employees ADD COLUMN email VARCHAR(255) UNIQUE;
ALTER TABLE employees ADD COLUMN user_id UUID UNIQUE REFERENCES users(id);
ALTER TABLE employees ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE employees ADD COLUMN hire_date DATE;
ALTER TABLE employees ADD COLUMN department VARCHAR(100);

-- Sessions utilisateur pour sécurité avancée
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW()
);

-- Logs d'audit pour traçabilité
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  employee_id UUID REFERENCES employees(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);