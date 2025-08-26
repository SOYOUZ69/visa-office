import React from "react";
import { Card, CardTitle, CardHeader, CardContent } from "../../ui/card";
import { Client } from "@/types";

const Timestamps = ({ client }: { client: Client }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
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
            <label className="text-sm font-medium text-gray-500">
              Last Updated
            </label>
            <p className="text-lg">{formatDate(client.updatedAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Timestamps;
