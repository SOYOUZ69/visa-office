"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface InfoTooltipProps {
  costPrediction: string;
  estimatedProfit: string;
  onConfirm?: (isCorrect: boolean) => void;
  onValuesUpdate?: (costPrediction: string, estimatedProfit: string) => void;
}

export function InfoTooltip({
  costPrediction,
  estimatedProfit,
  onConfirm,
  onValuesUpdate,
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempCost, setTempCost] = useState(costPrediction);
  const [tempProfit, setTempProfit] = useState(estimatedProfit);

  const handleConfirm = (isCorrect: boolean) => {
    if (isCorrect) {
      setIsEditing(true);
      setTempCost(costPrediction);
      setTempProfit(estimatedProfit);
    } else {
      onConfirm?.(isCorrect);
      setIsOpen(false);
    }
  };

  const handleSaveChanges = () => {
    onValuesUpdate?.(tempCost, tempProfit);
    setIsEditing(false);
    setIsOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempCost(costPrediction);
    setTempProfit(estimatedProfit);
  };

  return (
    <HoverCard open={isOpen} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
        >
          <Info className="h-4 w-4" />
          <span className="sr-only">Service information</span>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-4" side="top" align="center">
        <div className="space-y-3">
          {!isEditing ? (
            <>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Cost Prediction for service
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {costPrediction}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Minimum Payment for 30% profit
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {estimatedProfit}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-2">
                  Is this correct?
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleConfirm(true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConfirm(false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="cost-input" className="text-sm font-medium">
                    Cost Prediction for service
                  </Label>
                  <Input
                    id="cost-input"
                    value={tempCost}
                    onChange={(e) => setTempCost(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profit-input" className="text-sm font-medium">
                    Estimated Profit
                  </Label>
                  <Input
                    id="profit-input"
                    value={tempProfit}
                    onChange={(e) => setTempProfit(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveChanges}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
