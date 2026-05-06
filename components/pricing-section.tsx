"use client";

import { useMetaPixel } from "@/components/meta-pixel";
import { PlanChangeConfirm } from "@/components/plan-change-confirm";
import { PeriodToggle } from "@/components/pricing-toggle";
import { useUserDataOptional } from "@/contexts/user-data-context";
import { ProductKey, User } from "@/lib/db/schema";
import { detectOS, handleDownload } from "@/lib/download-handler";
import { generateEventId } from "@/lib/meta";
import { changePlanAction, customerPortalAction } from "@/lib/payments/actions";
import { formatPrice } from "@/lib/utils";
import {
  Check,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface PricingSectionProps {
  user?: User | null;
  isCompact?: boolean;
  variant?: "landing" | "dashboard";
}

interface ProductPrices {
  proMonthly: string | null;
  proAnnual: string | null;
  unlimitedMonthly: string | null;
  unlimitedAnnual: string | null;
}

interface ProductSubscription {
  active: boolean;
  tier: string;
  originalTier?: string;
  status: string;
  isAnnual?: boolean;
  stripeSubscriptionId?: string | null;
  accountLimit?: number | null;
  billingPeriod?: "monthly" | "annual" | null;
  expiresAt?: string | null;
}

interface UserEntitlements {
  multi: ProductSubscription | null;
}

interface PendingChange {
  product: ProductKey;
  currentTier: string;
  newTier: string;
  currentPeriod: "monthly" | "annual";
  newPeriod: "monthly" | "annual";
  currentPrice: number;
  newPrice: number;
  isUpgrade: boolean;
  priceId: string;
}

export function PricingSection({
  user,
  isCompact = false,
  variant = "dashboard",
}: PricingSectionProps) {
  const isLanding = variant === "landing";
  const { trackInitiateCheckout } = useMetaPixel();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const userDataContext = useUserDataOptional();
  const contextData = userDataContext?.data;
  const isLoadingEntitlements = userDataContext?.isLoading ?? false;
  const hasRefetchedRef = useRef(false);
  
  useEffect(() => {
    if (!isLanding && userDataContext?.refetch && !hasRefetchedRef.current) {
      hasRefetchedRef.current = true;
      userDataContext.refetch();
    }
  }, [isLanding, userDataContext?.refetch]);
  
  const [isAnnual, setIsAnnual] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isPortalLoading, setIsPortalLoading] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [userOS, setUserOS] = useState<"windows" | "mac">("windows");
  
  const [entitlements, setEntitlements] = useState<UserEntitlements>({
    multi: contextData?.entitlements.multi || null,
  });
  const [priceIds, setPriceIds] = useState<{
    multi: ProductPrices;
  }>({
    multi: {
      proMonthly: null,
      proAnnual: null,
      unlimitedMonthly: null,
      unlimitedAnnual: null,
    },
  });
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [showConfirmInCard, setShowConfirmInCard] = useState<boolean>(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  const updateURLParams = useCallback(
    (updates: {
      product?: string;
      period?: string;
      accounts?: string;
    }) => {
      if (isLanding) return;

      const params = new URLSearchParams(window.location.search);

      if (updates.product !== undefined) {
        if (updates.product) {
          params.set("product", updates.product);
        } else {
          params.delete("product");
        }
      }

      if (updates.period !== undefined) {
        if (updates.period) {
          params.set("period", updates.period);
        } else {
          params.delete("period");
        }
      }

      if (updates.accounts !== undefined) {
        if (updates.accounts) {
          params.set("accounts", updates.accounts);
        } else {
          params.delete("accounts");
        }
      }

      const newURL = `${window.location.pathname}?${params.toString()}`;
      router.replace(newURL, { scroll: false });
    },
    [router, isLanding]
  );

  useEffect(() => {
    const os = detectOS();
    setUserOS(os);

    const productParam = searchParams.get("product");
    const periodParam = searchParams.get("period");
    const accountsParam = searchParams.get("accounts");

    if (periodParam === "monthly" || periodParam === "annual") {
      const isAnnualPeriod = periodParam === "annual";
      setIsAnnual(isAnnualPeriod);
      if (document.body.getAttribute("data-billing-period") !== periodParam) {
        document.body.setAttribute("data-billing-period", periodParam);
      }
    }

  }, []);

  useEffect(() => {
    const fetchPriceIds = async () => {
      try {
        const response = await fetch("/api/stripe/prices");
        if (response.ok) {
          const data = await response.json();
          setPriceIds({
            multi: data.multi || {
              proMonthly: null,
              proAnnual: null,
              unlimitedMonthly: null,
              unlimitedAnnual: null,
            },
          });
        }
      } catch (error) {
      }
    };

    fetchPriceIds();
  }, []);

  useEffect(() => {
    if (contextData) {
      setEntitlements({
        multi: contextData.entitlements.multi || null,
      });
    }
  }, [contextData]);

  useEffect(() => {
    const billingPeriod = document.body.getAttribute("data-billing-period");
    const isAnnualPeriod = billingPeriod === "annual";
    setIsAnnual(isAnnualPeriod);

    if (!billingPeriod) {
      document.body.setAttribute("data-billing-period", "monthly");
    }

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-billing-period"
        ) {
          const newBillingPeriod = document.body.getAttribute(
            "data-billing-period"
          );
          const isAnnualPeriod = newBillingPeriod === "annual";
          setIsAnnual(isAnnualPeriod);
          const period = isAnnualPeriod ? "annual" : "monthly";
          updateURLParams({ period });
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, [updateURLParams]);



  const handlePeriodChange = useCallback((value: boolean) => {
    document.body.setAttribute(
      "data-billing-period",
      value ? "annual" : "monthly"
    );
  }, []);

  const handleDownloadClick = async () => {
    await handleDownload("multi", userOS);
  };

  const handleDashboardClick = () => {
    window.open("/dashboard", "_blank");
  };

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const result = await customerPortalAction("multi");
      if (result?.redirect) {
        window.location.href = result.redirect;
        return;
      }
      if (result?.error) {
      }
    } catch (error) {
    } finally {
      setIsPortalLoading(false);
    }
  };

  const proMonthlyPrice = 19;
  const proAnnualPrice = 182;
  const unlimitedMonthlyPrice = 50;
  const unlimitedAnnualPrice = 480;

  const handleCheckout = async (plan: string, priceId: string | null) => {
    if (!priceId) {
      return;
    }

    const productKey: ProductKey = "multi";
    const currentBillingPeriod = (currentSubscription as any)?.billingPeriod as "monthly" | "annual" | null | undefined;
    const selectedBillingPeriod = isAnnual ? "annual" : "monthly";

    if (hasActiveSubscription && !isAdminAssigned && !isUserAdmin) {
      const tierOrder = { free: 0, pro: 1, unlimited: 2 };
      const newTier = plan.toLowerCase() as "pro" | "unlimited";
      const currentTierValue = tierOrder[currentTier as keyof typeof tierOrder] ?? 0;
      const newTierValue = tierOrder[newTier] ?? 0;
      const isSameTier = currentTier === newTier;
      const isSameBillingPeriod = currentBillingPeriod === selectedBillingPeriod;

      if (isSameTier && isSameBillingPeriod) {
        alert("You are already on this plan.");
        return;
      }
      
      const getCurrentPrice = () => {
        if (currentTier === "unlimited") {
          return currentBillingPeriod === "annual" ? unlimitedAnnualPrice : unlimitedMonthlyPrice;
        }
        if (currentTier === "pro") {
          return currentBillingPeriod === "annual" ? proAnnualPrice : proMonthlyPrice;
        }
        return 0;
      };
      
      const getNewPrice = () => {
        if (newTier === "unlimited") {
          return selectedBillingPeriod === "annual" ? unlimitedAnnualPrice : unlimitedMonthlyPrice;
        }
        if (newTier === "pro") {
          return selectedBillingPeriod === "annual" ? proAnnualPrice : proMonthlyPrice;
        }
        return 0;
      };
      
      const currentPrice = getCurrentPrice();
      const newPrice = getNewPrice();
      
      const getMonthlyValueForComparison = (tier: string, period: "monthly" | "annual") => {
        if (tier === "unlimited") return period === "annual" ? unlimitedAnnualPrice / 12 : unlimitedMonthlyPrice;
        if (tier === "pro") return period === "annual" ? proAnnualPrice / 12 : proMonthlyPrice;
        return 0;
      };
      
      const currentMonthlyValue = getMonthlyValueForComparison(currentTier, currentBillingPeriod || "monthly");
      const newMonthlyValue = getMonthlyValueForComparison(newTier, selectedBillingPeriod);
      
      const isUpgrade = newTierValue > currentTierValue || newMonthlyValue > currentMonthlyValue;
      
      const tierDisplayNames: Record<string, string> = { free: "Free", pro: "Pro", unlimited: "Unlimited" };
      
      setPendingChange({
        product: "multi",
        currentTier: tierDisplayNames[currentTier] || "Free",
        newTier: tierDisplayNames[newTier] || newTier,
        currentPeriod: currentBillingPeriod || "monthly",
        newPeriod: selectedBillingPeriod,
        currentPrice,
        newPrice,
        isUpgrade,
        priceId,
      });
      setShowConfirmInCard(true);
      return;
    }

    try {
      setIsCheckoutLoading(true);
      setSelectedPlan(plan.toLowerCase());

      const eventId = generateEventId();
      const checkoutValue = plan.toLowerCase() === "pro"
        ? (isAnnual ? proAnnualPrice : proMonthlyPrice)
        : (isAnnual ? unlimitedAnnualPrice : unlimitedMonthlyPrice);
      trackInitiateCheckout(
        {
          content_name: `${plan} (MULTI)`,
          content_category: hasActiveSubscription
            ? "plan_change"
            : "new_subscription",
          value: checkoutValue,
          currency: "USD",
        },
        eventId
      );

      const isBillingPeriodChange = hasActiveSubscription && 
        currentBillingPeriod && 
        currentBillingPeriod !== selectedBillingPeriod;

      const isUpgrade =
        hasActiveSubscription &&
        ((currentTier === "free" && (plan.toLowerCase() === "pro" || plan.toLowerCase() === "unlimited")) ||
         (currentTier === "pro" && plan.toLowerCase() === "unlimited"));

      if (isUpgrade || isBillingPeriodChange) {
      } else if (hasActiveSubscription) {
        const result = await changePlanAction("multi", priceId);

        if (result.success) {
          window.location.href = `/dashboard/pricing?success=plan-changed&product=multi`;
          return;
        }

        if (result.error) {
          if (result.error === "same-plan") {
            alert("You are already on this plan.");
          } else {
            alert(`Error changing plan: ${result.error}`);
          }
          setIsCheckoutLoading(false);
          return;
        }
      }
      
      const tier = plan.toLowerCase() as "pro" | "unlimited";
      const billingPeriod = isAnnual ? "annual" : "monthly";
      
      const checkoutUrl = "/api/checkout";
      const currentUrl = `${window.location.origin}${pathname}${window.location.search}`;
      const requestBody = {
        priceId,
        productKey,
        tier,
        billingPeriod,
        cancelUrl: currentUrl,
        metaEventId: eventId,
        metaValue: checkoutValue,
        metaCurrency: "USD",
        metaContentName: `${plan} (MULTI)`,
      };

      const response = await fetch(checkoutUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();

        if (response.status === 401 && data.redirect) {
          window.location.href = data.redirect;
          return;
        }

        throw new Error(data.error || "Failed to start checkout process");
      }

      const data = await response.json();
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }

      throw new Error("No redirect URL received from checkout");
    } catch (error) {
      setIsCheckoutLoading(false);
    }
  };

  const handleTierChangeConfirm = async () => {
    if (!pendingChange || !pendingChange.priceId) return;
    
    setIsUpdatingSubscription(true);
    
    try {
      const result = await changePlanAction(pendingChange.product, pendingChange.priceId);
      
      if (result.success) {
        window.location.href = `/dashboard/pricing?success=plan-changed&product=${pendingChange.product}`;
        return;
      }
      
      if (result.error) {
        alert(`Error changing plan: ${result.error}`);
        setIsUpdatingSubscription(false);
        setShowConfirmInCard(false);
        setPendingChange(null);
      }
    } catch (error) {
      alert("An error occurred while changing your plan.");
      setIsUpdatingSubscription(false);
      setShowConfirmInCard(false);
      setPendingChange(null);
    }
  };

  const handleTierChangeCancel = () => {
    setShowConfirmInCard(false);
    setPendingChange(null);
  };

  const currentPrices = priceIds.multi;
  const currentSubscription = entitlements.multi;
  const hasActiveSubscription =
    currentSubscription?.active &&
    ["active", "trialing", "admin_assigned", "canceling"].includes(
      currentSubscription.status
    );
  const isAdminAssigned = currentSubscription?.status === "admin_assigned";
  const isCanceled = currentSubscription?.status === "canceled";
  const isCanceling = currentSubscription?.status === "canceling";
  const isUserAdmin = user?.role === "admin";
  
  const currentTier = (isCanceled || isCanceling)
    ? (currentSubscription?.originalTier || currentSubscription?.tier || "free")
    : (currentSubscription?.tier || "free");
  
  const isCanceledButStillValid = (): boolean => {
    if ((!isCanceled && !isCanceling) || !currentSubscription) return false;
    if (!currentSubscription.expiresAt) return isCanceling;
    const expiresAt = new Date(currentSubscription.expiresAt);
    const now = new Date();
    return expiresAt > now;
  };

  const isPlanMatching = (options?: {
    tier?: "free" | "pro" | "unlimited";
    billingPeriod?: "monthly" | "annual";
  }): boolean => {
    if (!currentSubscription) return false;
    
    const currentBillingPeriod = (currentSubscription as any)?.billingPeriod as "monthly" | "annual" | null | undefined;
    const selectedBillingPeriod = options?.billingPeriod || (isAnnual ? "annual" : "monthly");
    
    const subscriptionTier = (isCanceled || isCanceling)
      ? (currentSubscription.originalTier || currentSubscription.tier || "free")
      : (currentSubscription.tier || "free");
    const tierMatch = !options?.tier || subscriptionTier === options.tier;
    const billingMatch = !currentBillingPeriod || currentBillingPeriod === selectedBillingPeriod;
    return tierMatch && billingMatch;
  };

  const isCardCurrent = (options: {
    tier?: "free" | "pro" | "unlimited";
  }): boolean => {
    if (!currentSubscription) {
      return options.tier === "free";
    }
    
    const currentBillingPeriod = (currentSubscription as any)?.billingPeriod as "monthly" | "annual" | null | undefined;
    const selectedBillingPeriod = isAnnual ? "annual" : "monthly";
    
    if (isCanceled || isCanceling) {
      const stillValid = isCanceledButStillValid();
      if (stillValid) {
        const originalTier = currentSubscription.originalTier || currentSubscription.tier || "free";
        if (!options.tier) return false;
        
        return originalTier === options.tier;
      } else {
        return options.tier === "free";
      }
    }
    
    if (!options.tier) return false;
    const subscriptionTier = currentSubscription.tier || "free";
    if (subscriptionTier !== options.tier) {
      return false;
    }
    const billingMatch = !currentBillingPeriod || currentBillingPeriod === selectedBillingPeriod;
    return billingMatch;
  };

  const shouldShowResubscribe = (options?: {
    tier?: "free" | "pro" | "unlimited";
    billingPeriod?: "monthly" | "annual";
  }): boolean => {
    return isCanceledButStillValid() && isPlanMatching(options);
  };

  const getCanceledMessage = (options: { tier?: "pro" | "unlimited" }): string | null => {
    if (!isCanceledButStillValid()) return null;
    
    const originalTier = currentSubscription?.originalTier || currentSubscription?.tier || "free";
    if (originalTier !== options.tier) return null;
    
    const expiresAt = currentSubscription?.expiresAt;
    if (!expiresAt) return null;
    
    const expirationDate = new Date(expiresAt);
    const formattedDate = expirationDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    
    return `Canceled - Valid until ${formattedDate}`;
  };

  const shouldShowChangeButton = (options?: {
    tier?: "free" | "pro" | "unlimited";
    billingPeriod?: "monthly" | "annual";
  }): boolean => {
    if (!hasActiveSubscription || isAdminAssigned || isUserAdmin) {
      return false;
    }
    
    return !isPlanMatching(options);
  };

  const getButtonConfig = (planType: "free" | "pro" | "unlimited") => {
    const tierOrder = { free: 0, pro: 1, unlimited: 2 };
    const planTierValue = tierOrder[planType];
    const currentTierValue =
      tierOrder[currentTier as keyof typeof tierOrder] ?? 0;

    const disabledStyle = "mt-6 inline-flex items-center gap-1 rounded-full py-2 px-6 bg-gray-200 text-gray-600 cursor-not-allowed text-md transition-all duration-200 text-xl border border-gray-200";
    const actionStyle = "mt-6 inline-flex items-center gap-1 rounded-full py-2 px-6 bg-white border border-gray-200 text-black hover:bg-gray-100 cursor-pointer text-md transition-all duration-200 text-xl";
    const fadedStyle = "mt-6 inline-flex items-center gap-1 rounded-full py-2 px-6 bg-gray-100 text-gray-400 cursor-not-allowed text-md transition-all duration-200 text-xl opacity-50 border border-gray-200";

    if (isLoadingEntitlements && user) {
      return {
        text: planType === "free" ? "Current plan" : "Subscribe",
        onClick: () => {},
        disabled: true,
        className: disabledStyle,
      };
    }

    if (!user) {
      if (planType === "free") {
        return {
          text: "Download",
          onClick: handleDownloadClick,
          disabled: false,
          className: actionStyle,
        };
      }
      const displayName = planType === "pro" ? "Pro" : "Unlimited";
      return {
        text: `Get ${displayName}`,
        onClick: () => {
          const period = isAnnual ? "annual" : "monthly";
          const base = isLanding ? "/dashboard/pricing" : "/pricing";
          window.open(`${base}?period=${period}`, "_blank");
        },
        disabled: false,
        className: actionStyle,
      };
    }

    if (planType === "free") {
      if (isCardCurrent({ tier: "free" })) {
        return {
          text: "Current plan",
          onClick: () => {},
          disabled: true,
          className: disabledStyle,
        };
      }
      return {
        text: "Free",
        onClick: () => {},
        disabled: true,
        className: fadedStyle,
      };
    }

    if (planType === "pro" || planType === "unlimited") {
      if (!currentPrices) {
        return {
          text: "Subscribe",
          onClick: () => {},
          disabled: true,
          className: disabledStyle,
        };
      }

      const priceId = planType === "pro"
        ? (isAnnual ? currentPrices.proAnnual : currentPrices.proMonthly)
        : (isAnnual ? currentPrices.unlimitedAnnual : currentPrices.unlimitedMonthly);
      const isLoading = isCheckoutLoading && selectedPlan === planType;
      const isPriceIdMissing = !priceId;
      const displayName = planType === "pro" ? "Pro" : "Unlimited";

      const isCurrentPlan = isPlanMatching({ tier: planType, billingPeriod: isAnnual ? "annual" : "monthly" });
      
      if (isCurrentPlan && hasActiveSubscription) {
        if (isAdminAssigned || isUserAdmin) {
          return {
            text: isAdminAssigned ? "Assigned by admin" : "Admin access",
            onClick: () => {},
            disabled: true,
            className: disabledStyle,
          };
        }
        if (isCanceling) {
          return {
            text: isPortalLoading ? "Opening..." : "Reactivate",
            onClick: handleManageSubscription,
            disabled: isPortalLoading,
            className: actionStyle,
          };
        }
        return {
          text: isPortalLoading ? "Opening..." : "Manage",
          onClick: handleManageSubscription,
          disabled: isPortalLoading,
          className: actionStyle,
        };
      }
      
      if (shouldShowResubscribe({ tier: planType, billingPeriod: isAnnual ? "annual" : "monthly" })) {
        return {
          text: "Resubscribe",
          onClick: () => {
            if (!isPriceIdMissing) {
              handleCheckout(displayName, priceId);
            }
          },
          disabled: isLoading || isPriceIdMissing,
          className: isLoading || isPriceIdMissing ? disabledStyle : actionStyle,
        };
      }

      const getMonthlyValue = (tier: string, billingPeriod: "monthly" | "annual"): number => {
        if (tier === "unlimited") return billingPeriod === "annual" ? unlimitedAnnualPrice / 12 : unlimitedMonthlyPrice;
        if (tier === "pro") return billingPeriod === "annual" ? proAnnualPrice / 12 : proMonthlyPrice;
        return 0;
      };

      const currentBillingPeriod = (currentSubscription as any)?.billingPeriod as "monthly" | "annual" | null | undefined;
      const selectedBillingPeriod = isAnnual ? "annual" : "monthly";
      
      const hasSubscriptionToCompare = hasActiveSubscription || isCanceledButStillValid();
      
      const currentMonthlyValue = hasSubscriptionToCompare ? getMonthlyValue(currentTier, currentBillingPeriod || "monthly") : 0;
      const newMonthlyValue = getMonthlyValue(planType, selectedBillingPeriod);
      
      const isTierUpgrade = hasSubscriptionToCompare && currentTierValue < planTierValue;
      const isTierDowngrade = hasSubscriptionToCompare && currentTierValue > planTierValue;
      const isBillingPeriodChange = hasSubscriptionToCompare && 
        currentBillingPeriod && 
        currentBillingPeriod !== selectedBillingPeriod &&
        currentTierValue === planTierValue;
      const isValueUpgrade = hasSubscriptionToCompare && newMonthlyValue > currentMonthlyValue;
      const isSamePlan = hasSubscriptionToCompare && 
        currentTierValue === planTierValue && 
        currentBillingPeriod === selectedBillingPeriod;

      let buttonText = "Subscribe";
      if (hasSubscriptionToCompare) {
        if (isSamePlan && isCanceledButStillValid()) {
          buttonText = "Resubscribe";
        }
        else if (isBillingPeriodChange) {
          buttonText = currentBillingPeriod === "monthly" ? "Switch to Annual" : "Switch to Monthly";
        }
        else if (isTierDowngrade) {
          buttonText = "Downgrade";
        }
        else if (isTierUpgrade || isValueUpgrade) {
          buttonText = "Upgrade";
        }
      }
      return {
        text: isLoading ? "Processing..." : buttonText,
        onClick: () => {
          if (!isPriceIdMissing) {
            handleCheckout(displayName, priceId);
          }
        },
        disabled: isLoading || isPriceIdMissing,
        className: isLoading || isPriceIdMissing ? disabledStyle : actionStyle,
      };
    }

    return {
      text: "Subscribe",
      onClick: () => {},
      disabled: true,
      className: disabledStyle,
    };
  };

  const freeButtonConfig = getButtonConfig("free");
  const proButtonConfig = getButtonConfig("pro");
  const unlimitedButtonConfig = getButtonConfig("unlimited");


  const cardBase = "rounded-lg p-6 flex flex-col relative";
  const lightCard = `${cardBase} bg-gray-100`;
  const grayCard = `${cardBase} bg-gray-400`;
  const darkCard = `${cardBase} bg-gray-800`;
  const checkLight = "h-4 w-4 shrink-0 mt-0.5 text-gray-900";
  const checkDark = "h-4 w-4 shrink-0 mt-0.5 text-white";
  const featureTextLight = "ml-3 text-sm text-gray-900";
  const featureTextDark = "ml-3 text-sm text-white";
  const pillLight = "inline-flex items-center gap-1.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-full px-3 py-1.5";
  const pillDark = "inline-flex items-center gap-1.5 text-xs text-white bg-gray-600 border border-gray-500 rounded-full px-3 py-1.5";

  const renderConfirmOrButton = (
    tier: "Pro" | "Unlimited",
    btnConfig: typeof proButtonConfig,
    isDark: boolean
  ) => (
    <>
      {showConfirmInCard && pendingChange?.newTier === tier && (
        <PlanChangeConfirm
          type="tier"
          isUpgrade={pendingChange.isUpgrade}
          currentTier={pendingChange.currentTier || "Free"}
          newTier={pendingChange.newTier}
          currentPrice={pendingChange.currentPrice}
          newPrice={pendingChange.newPrice}
          currentPeriod={pendingChange.currentPeriod}
          newPeriod={pendingChange.newPeriod}
          onConfirm={handleTierChangeConfirm}
          onCancel={handleTierChangeCancel}
          isLoading={isUpdatingSubscription}
        />
      )}
      {!(showConfirmInCard && pendingChange?.newTier === tier) && (
        <div
          onClick={btnConfig.disabled ? undefined : btnConfig.onClick}
          className={btnConfig.className}
        >
          {btnConfig.text}
        </div>
      )}
    </>
  );

  const renderCanceledMessage = (tier: "pro" | "unlimited", isDark: boolean) => {
    const message = getCanceledMessage({ tier });
    if (!message || !user) return null;
    const datePart = message.replace("Canceled - Valid until ", "");
    return (
      <div className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
        Canceled - Valid until {datePart}
      </div>
    );
  };

  return (
    <section
      id="prices"
      className={`scroll-mt-5 ${isCompact ? "py-3" : "py-24 "} pb-10`}
    >
      <div className={`max-w-7xl mx-auto ${isLanding ? "px-4" : ""}`}>
        {!isCompact && (
          <h2 className="text-6xl text-gray-900 mb-6 text-center">Pricing</h2>
        )}

        {!isLanding && (
          <>
            <p className="text-xl mb-1 mt-3">Billing period</p>
            <p className="text-sm text-gray-600 mb-3">
              Choose your billing cycle
            </p>
          </>
        )}
        <div
          className={`flex ${isCompact ? "justify-start mb-3" : "justify-center mb-3"} ${isLanding ? "mb-6" : ""} mb-4`}
        >
          <PeriodToggle
            isCompact={isCompact}
            isAnnual={isAnnual}
            onPeriodChange={handlePeriodChange}
            annualSavingsLabel="Save 20% annually"
          />
        </div>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${variant === "landing" ? "w-full" : ""}`}
        >
          <div className={`${lightCard} ${variant === "landing" ? "w-full min-h-0" : ""}`}>
            {isCardCurrent({ tier: "free" }) && user && (
              <div className="absolute top-3 right-3">
                <span className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-600 text-white">
                  Current
                </span>
              </div>
            )}

            <p className="text-xs font-medium  text-gray-400 mb-1">Free</p>
            <h3 className="text-2xl text-gray-900 mb-3">Multi Trial</h3>

            <div className="mb-4">
              <div className={`${!isAnnual ? "" : "hidden"}`}>
                <span className="text-4xl text-gray-900">$0</span>
                <span className="text-xl text-gray-500">/mo</span>
              </div>
              <div className={`${isAnnual ? "" : "hidden"}`}>
                <span className="text-4xl text-gray-900">$0</span>
                <span className="text-xl text-gray-500">/mo</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={pillLight}>3 accounts</span>
              <span className={pillLight}>0.01 lot fixed</span>
            </div>

            <div className="grow mb-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className={checkLight} strokeWidth={2.5} />
                  <p className={featureTextLight}>MT4, MT5 & cTrader (Windows); MT5 & cTrader (macOS)</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkLight} strokeWidth={2.5} />
                  <p className={featureTextLight}>Local execution</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkLight} strokeWidth={2.5} />
                  <p className={featureTextLight}>Single IP address</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkLight} strokeWidth={2.5} />
                  <p className={featureTextLight}>Trade calendar, history & analytics</p>
                </li>
              </ul>
            </div>

            <div
              onClick={freeButtonConfig.disabled ? undefined : freeButtonConfig.onClick}
              className={freeButtonConfig.className}
            >
              {freeButtonConfig.text}
            </div>
          </div>

          <div className={`${grayCard} border border-gray-200 ${variant === "landing" ? "w-full min-h-0" : ""}`}>
            {isCardCurrent({ tier: "pro" }) && user ? (
              <div className="absolute top-4 right-6">
                <span className="text-xs px-2 py-1 rounded-full border border-gray-400 bg-gray-600 text-white">
                  Current
                </span>
              </div>
            ) : (
              <div className="absolute top-4 right-6">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-800 text-white border-green-800">
                  Most popular
                </span>
              </div>
            )}

            <p className="text-xs font-medium text-gray-200 mb-1">Starter</p>
            <h3 className="text-2xl text-white mb-3">Multi Pro</h3>

            <div className="mb-4">
              <div className={`${!isAnnual ? "" : "hidden"}`}>
                <span className="text-4xl text-white">
                  ${formatPrice(proMonthlyPrice)}
                </span>
                <span className="text-xl text-gray-200">/mo</span>
              </div>
              <div className={`${isAnnual ? "" : "hidden"}`}>
                <span className="text-4xl text-white">
                  ${formatPrice(proAnnualPrice)}
                </span>
                <span className="text-xl text-gray-200">/year</span>
                <span className="text-xl text-white pl-2">${Math.round(proMonthlyPrice * 12 - proAnnualPrice)} saved</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={pillDark}>8 accounts</span>
              <span className={pillDark}>Full control</span>
            </div>

            <div className="grow mb-6">
              <ul className="space-y-3 ">
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>MT4, MT5 & cTrader (Windows); MT5 & cTrader (macOS)</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Local execution</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Single IP address</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Trade calendar, history & analytics</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Full copy configuration</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Prop firm ready</p>
                </li>
              </ul>
            </div>

            {renderCanceledMessage("pro", false)}
            {renderConfirmOrButton("Pro", proButtonConfig, false)}
          </div>

          <div className={`${darkCard} ${variant === "landing" ? "w-full min-h-0" : ""}`}>
            {isCardCurrent({ tier: "unlimited" }) && user && (
              <div className="absolute top-3 right-3">
                <span className="text-xs px-2 py-1 rounded-full font-medium border border-gray-600 bg-white text-gray-900">
                  Current
                </span>
              </div>
            )}

            <p className="text-xs font-medium  text-gray-400 mb-1">Power</p>
            <h3 className="text-2xl text-white mb-3">Multi Unlimited</h3>

            <div className="mb-4">
              <div className={`${!isAnnual ? "" : "hidden"}`}>
                <span className="text-4xl text-white">
                  ${formatPrice(unlimitedMonthlyPrice)}
                </span>
                <span className="text-xl text-gray-400">/mo</span>
              </div>
              <div className={`${isAnnual ? "" : "hidden"}`}>
                <span className="text-4xl text-white">
                  ${formatPrice(unlimitedAnnualPrice)}
                </span>
                <span className="text-xl text-gray-400">/year</span>
                <span className="text-xl text-white pl-2">${Math.round(unlimitedMonthlyPrice * 12 - unlimitedAnnualPrice)} saved</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={pillDark}>Unlimited accounts</span>
              <span className={pillDark}>Full control</span>
            </div>

            <div className="grow mb-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>MT4, MT5 & cTrader (Windows); MT5 & cTrader (macOS)</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Local execution</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Single IP address</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Trade calendar, history & analytics</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Full copy configuration</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Prop firm ready</p>
                </li>
                <li className="flex items-start">
                  <Check className={checkDark} strokeWidth={2.5} />
                  <p className={featureTextDark}>Priority support</p>
                </li>
              </ul>
            </div>

            {renderCanceledMessage("unlimited", true)}
            {renderConfirmOrButton("Unlimited", unlimitedButtonConfig, true)}
          </div>
        </div>
      </div>
    </section>
  );
}
