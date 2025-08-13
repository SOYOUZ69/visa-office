'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clientsAPI, attachmentsAPI } from '@/lib/api';
import { Client, Attachment } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Download, Trash2, Upload, User, Phone, Building2, FileText, Users } from 'lucide-react';
import { ServicesSection } from '@/components/clients/ServicesSection';

interface ClientDetailProps {
  clientId: string;
}

export function ClientDetail({ clientId }: ClientDetailProps) {
  const [client, setClient] = useState<Client | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadClientData();
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    try {
      const [clientData, attachmentsData] = await Promise.all([
        clientsAPI.getById(clientId),
        attachmentsAPI.getByClient(clientId),
      ]);
      setClient(clientData);
      setAttachments(attachmentsData);
    } catch (error) {
      toast.error('Failed to load client data');
      console.error('Failed to load client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await attachmentsAPI.upload(clientId, file, 'DOCUMENT');
      toast.success('File uploaded successfully');
      loadClientData(); // Reload attachments
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await attachmentsAPI.delete(attachmentId);
      toast.success('File deleted successfully');
      loadClientData(); // Reload attachments
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      const blob = await attachmentsAPI.download(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING_DOCS':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading client data...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Client Not Found</CardTitle>
          <CardDescription>
            The requested client could not be found.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-lg font-semibold">{client.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{client.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Address</label>
              <p className="text-lg">{client.address}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Destination</label>
              <p className="text-lg">{client.destination}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Job Title</label>
              <p className="text-lg">{client.jobTitle || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Passport Number</label>
              <p className="text-lg">{client.passportNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Visa Type</label>
              <p className="text-lg">{client.visaType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Client Type</label>
              <p className="text-lg">{client.clientType.replace('_', ' ')}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge className={getStatusColor(client.status)}>
                {client.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          {client.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Notes</label>
              <p className="text-lg mt-1">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Numbers */}
      {client.phoneNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Phone Numbers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {client.phoneNumbers.map((phone, index) => (
                <div key={phone.id} className="flex items-center space-x-2">
                  <span className="text-lg">{phone.number}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employers */}
      {client.employers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Employers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.employers.map((employer) => (
                <div key={employer.id} className="border rounded-lg p-4">
                  <div className="font-semibold">{employer.name}</div>
                  {employer.position && (
                    <div className="text-gray-600">{employer.position}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Members */}
      {client.familyMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Family Members</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.familyMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="font-semibold">{member.fullName}</div>
                  <div className="text-gray-600">{member.relationship}</div>
                  {member.age && (
                    <div className="text-gray-600">Age: {member.age}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documents</span>
          </CardTitle>
          <CardDescription>
            Upload and manage client documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.role === 'ADMIN' && (
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="flex-1"
                disabled={uploading}
              />
              <Upload className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{attachment.originalName}</div>
                      <div className="text-sm text-gray-500">
                        {attachment.type} • {(attachment.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {user?.role === 'ADMIN' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No documents uploaded yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Services Section */}
      <ServicesSection clientId={clientId} />

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Timestamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-lg">{formatDate(client.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Updated</label>
              <p className="text-lg">{formatDate(client.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
