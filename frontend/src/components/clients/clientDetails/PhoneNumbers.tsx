import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Phone } from "lucide-react";
import { Client } from "@/types";

const PhoneNumbers = ({ client }: { client: Client }) => {
  return (
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
  );
};

export default PhoneNumbers;
