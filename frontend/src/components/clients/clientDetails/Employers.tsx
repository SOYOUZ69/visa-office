import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Building2 } from "lucide-react";
import { Client } from "@/types";

const Employers = ({ client }: { client: Client }) => {
  return (
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
  );
};

export default Employers;
