import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../../ui/card";

const CLientNotFound = () => {
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
};

export default CLientNotFound;
