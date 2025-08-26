import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Users, User, CreditCard, Heart } from "lucide-react";
import { Client } from "@/types";

const FamilyMembers = ({ client }: { client: Client }) => {
  return (
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
              <div className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                {member.fullName}
              </div>
              <div className="text-gray-600 space-y-1 mt-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-3 w-3" />
                  <span>Passport: {member.passportNumber}</span>
                </div>
                {member.relationship && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3" />
                    <span>Relationship: {member.relationship}</span>
                  </div>
                )}
                {member.age && (
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 flex items-center justify-center text-xs rounded-full bg-gray-200">
                      #
                    </span>
                    <span>Age: {member.age}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyMembers;
