import React, { useEffect, useState } from "react";
import { InfoTooltip } from "./InfoTooltip";
import { AiMicroServiceAPI } from "@/lib/api";

export const CostPredictionCard = ({
  serviceSpec,
  country,
  quantity,
}: {
  serviceSpec: string[];
  country: string;
  quantity: number;
}) => {
  const [costPrediction, setCostPrediction] = useState("N/A");
  const [minimalPaymentReq, setMinimalPaymentReq] = useState("N/A");
  const [AIResponse, setAIResponse] = useState({
    base_cost: 12.55,
    ai_cost: 185.59156900351712,
    recommended_cost: 185.59156900351712,
    minimal_payment_30pct: 241.26903970457226,
  });
  const loadAiResponse = async () => {
    const response = await AiMicroServiceAPI.estimateCost({
      country,
      quantity,
      selectedServices: serviceSpec,
    });
    setAIResponse(response);
    setCostPrediction(response.recommended_cost.toString());
    setMinimalPaymentReq(response.minimal_payment_30pct.toString());
  };
  useEffect(() => {
    loadAiResponse();
  }, [serviceSpec, country, quantity]);
  return (
    <InfoTooltip
      costPrediction={costPrediction}
      estimatedProfit={minimalPaymentReq}
      onConfirm={(isCorrect) => {
        console.log("User confirmed:", isCorrect ? "Yes" : "No");
      }}
      onValuesUpdate={(newCost, newProfit) => {
        setCostPrediction(newCost);
        setMinimalPaymentReq(newProfit);
        console.log("Values updated:", {
          cost: newCost,
          profit: newProfit,
        });
      }}
    />
  );
};
