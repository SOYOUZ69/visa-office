import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Employee } from "@/types";

const EmployeeAssignmentDialog = ({
  isAssignDialogOpen,
  setIsAssignDialogOpen,
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
  selectedRole,
  setSelectedRole,
  handleAssignEmployee,
}: {
  isAssignDialogOpen: boolean;
  setIsAssignDialogOpen: (isOpen: boolean) => void;
  employees: Employee[];
  selectedEmployeeId: string;
  setSelectedEmployeeId: (employeeId: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  handleAssignEmployee: () => void;
}) => {
  return (
    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Employee to Dossier</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="employee-select">Select Employee</Label>
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.fullName} -{" "}
                    {employee.salaryType.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="role-input">Role (Optional)</Label>
            <input
              id="role-input"
              type="text"
              placeholder="e.g., Case Manager, Assistant"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignDialogOpen(false);
                setSelectedEmployeeId("");
                setSelectedRole("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignEmployee}>Assign Employee</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeAssignmentDialog;
