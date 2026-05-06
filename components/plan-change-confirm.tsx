"use client";

interface BasePlanChangeConfirmProps {
  isUpgrade: boolean;
  currentPrice: number;
  newPrice: number;
  currentPeriod: "monthly" | "annual";
  newPeriod: "monthly" | "annual";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface AccountsPlanChangeConfirmProps extends BasePlanChangeConfirmProps {
  type?: "accounts";
  currentAccounts: number;
  newAccounts: number;
  currentTier?: never;
  newTier?: never;
}

interface TierPlanChangeConfirmProps extends BasePlanChangeConfirmProps {
  type: "tier";
  currentTier: string;
  newTier: string;
  currentAccounts?: never;
  newAccounts?: never;
}

type PlanChangeConfirmProps = AccountsPlanChangeConfirmProps | TierPlanChangeConfirmProps;

export function PlanChangeConfirm(props: PlanChangeConfirmProps) {
  const {
  isUpgrade,
  currentPrice,
  newPrice,
  currentPeriod,
  newPeriod,
  onConfirm,
  onCancel,
  isLoading = false,
  } = props;

  const isAccountsType = props.type !== "tier";

  const formatPlanDescription = (isCurrent: boolean) => {
    if (isAccountsType) {
      const accounts = isCurrent ? props.currentAccounts : props.newAccounts;
      const price = isCurrent ? currentPrice : newPrice;
      const period = isCurrent ? currentPeriod : newPeriod;
      return (
        <>
          {accounts} {accounts === 1 ? "account" : "accounts"} · ${price}/{period === "annual" ? "yr" : "mo"}
        </>
      );
    } else {
      const tier = isCurrent ? props.currentTier : props.newTier;
      const price = isCurrent ? currentPrice : newPrice;
      const period = isCurrent ? currentPeriod : newPeriod;
      return (
        <>
          {tier} · ${price}/{period === "annual" ? "yr" : "mo"}
        </>
      );
    }
  };

  return (
    <div className="mt-4 rounded-lg bg-white p-3 border border-gray-200">
      <p className="text-lg text-gray-700 mb-2">
        {isUpgrade ? "Confirm Upgrade" : "Confirm Downgrade"}
      </p>

      <div className="bg-gray-100 rounded-lg p-3 space-y-2 text-sm border border-gray-200">
        <div className="flex justify-between text-gray-600">
          <span>Current:</span>
          <span>{formatPlanDescription(true)}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-700">
          <span>New:</span>
          <span>{formatPlanDescription(false)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        {isUpgrade
          ? "Your card will be charged the prorated difference."
          : "Credit will be applied to future invoices."}
      </p>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="cursor-pointer rounded-full border bg-white py-1 px-3 text-sm hover:bg-gray-100 disabled:hover:bg-white text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="cursor-pointer rounded-full text-white bg-black py-1 px-3 text-sm hover:bg-gray-600 disabled:hover:bg-black text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Confirming..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
