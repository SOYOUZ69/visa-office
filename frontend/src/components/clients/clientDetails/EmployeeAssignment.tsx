import { UserPlus, UserMinus, User } from "lucide-react";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../ui/card";
import { Button } from "../../ui/button";
import {
  Dossier,
  DossierEmployeeAssignment,
  Employee,
  User as UserType,
} from "@/types";

const EmployeeAssignment = ({
  selectedDossier,
  assignedEmployees,
  handleUnassignEmployee,
  user,
  setIsAssignDialogOpen,
}: {
  selectedDossier: Dossier;
  assignedEmployees: DossierEmployeeAssignment[];
  handleUnassignEmployee: (dossierId: string, employeeId: string) => void;
  user: UserType;
  setIsAssignDialogOpen: (isOpen: boolean) => void;
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Employee Assignment</span>
          </CardTitle>
          <CardDescription>
            Assign employees to dossier #
            {selectedDossier.id.slice(-8).toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Assignments */}
          {assignedEmployees && assignedEmployees.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Currently Assigned Employees
              </h4>
              {assignedEmployees.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">
                        {assignment.employee.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.role
                          ? `Role: ${assignment.role}`
                          : "No specific role"}
                      </div>
                      <div className="text-xs text-gray-400">
                        Assigned:{" "}
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  {user?.role === "ADMIN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUnassignEmployee(
                          selectedDossier.id,
                          assignment.employeeId
                        )
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No employees assigned to this dossier yet.
            </div>
          )}

          {/* Assign New Employee */}
          {user?.role === "ADMIN" && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Assign New Employee
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAssignDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Assign Employee
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default EmployeeAssignment;
