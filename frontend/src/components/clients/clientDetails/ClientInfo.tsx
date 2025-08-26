import React from "react";
import { Card, CardTitle, CardHeader, CardContent } from "../../ui/card";
import { Badge, User } from "lucide-react";
import { Client } from "@/types";

export const ClientInfo = ({ client }: { client: Client }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
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
            <label className="text-sm font-medium text-gray-500">
              Full Name
            </label>
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
            <label className="text-sm font-medium text-gray-500">
              Destination
            </label>
            <p className="text-lg">{client.destination}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Job Title
            </label>
            <p className="text-lg">{client.jobTitle || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Passport Number
            </label>
            <p className="text-lg">{client.passportNumber || "N/A"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Visa Type
            </label>
            <p className="text-lg">{client.visaType}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Client Type
            </label>
            <p className="text-lg">{client.clientType.replace("_", " ")}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Status</label>
          <div className="mt-1">
            <Badge className={getStatusColor(client.status)}>
              {client.status.replace("_", " ")}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Mineur</label>
          <div className="mt-1">
            <Badge
              className={
                client.isMinor
                  ? "bg-orange-100 text-orange-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {client.isMinor ? "Oui" : "Non"}
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
  );
};

export default ClientInfo;
