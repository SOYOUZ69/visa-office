import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../ui/card";
import { Shield } from "lucide-react";
import { Client } from "@/types";

const GuardianInfo = ({ client }: { client: Client }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Guardian Information</span>
        </CardTitle>
        <CardDescription>
          Information du tuteur légal (client mineur)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {client.guardianFullName && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Nom complet du tuteur
              </label>
              <p className="text-lg font-semibold">{client.guardianFullName}</p>
            </div>
          )}
          {client.guardianCIN && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                CIN du tuteur
              </label>
              <p className="text-lg">{client.guardianCIN}</p>
            </div>
          )}
          {client.guardianRelationship && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Relation
              </label>
              <p className="text-lg">{client.guardianRelationship}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuardianInfo;
