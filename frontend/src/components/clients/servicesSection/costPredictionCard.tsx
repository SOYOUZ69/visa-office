import React, { useState } from "react";
import { InfoTooltip } from "./InfoTooltip";

const costPredictionCard = () => {
  const [costPrediction, setCostPrediction] = useState("$150 - $200");
  const [estimatedProfit, setEstimatedProfit] = useState("$75 - $100");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Service Information
        </h1>

        <div className="flex items-center gap-2">
          <span className="text-foreground">Service Details</span>
          <InfoTooltip
            costPrediction={costPrediction}
            estimatedProfit={estimatedProfit}
            onConfirm={(isCorrect) => {
              console.log("User confirmed:", isCorrect ? "Yes" : "No");
            }}
            onValuesUpdate={(newCost, newProfit) => {
              setCostPrediction(newCost);
              setEstimatedProfit(newProfit);
              console.log("Values updated:", {
                cost: newCost,
                profit: newProfit,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default costPredictionCard;
