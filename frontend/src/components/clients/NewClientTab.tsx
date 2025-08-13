'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Users, User, Phone, Building2 } from 'lucide-react';

const clientTypes = [
  {
    id: 'INDIVIDUAL',
    name: 'Individual',
    description: 'Single person visa application',
    icon: User,
    color: 'bg-blue-500',
  },
  {
    id: 'FAMILY',
    name: 'Family',
    description: 'Family visa application',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    id: 'GROUP',
    name: 'Group',
    description: 'Group visa application',
    icon: Building2,
    color: 'bg-purple-500',
  },
  {
    id: 'PHONE_CALL',
    name: 'Phone Call',
    description: 'Phone call inquiry',
    icon: Phone,
    color: 'bg-orange-500',
  },
];

export function NewClientTab() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // If user is not admin, show read-only message
  if (user?.role !== 'ADMIN') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to create new clients.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    router.push(`/clients/new?type=${typeId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Select Client Type</h2>
        <p className="text-gray-600">
          Choose the type of client you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clientTypes.map((type) => (
          <Card
            key={type.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleTypeSelect(type.id)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${type.color}`}>
                  <type.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Create {type.name} Client
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
