"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function GuardianPaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/guardian/dashboard/billing");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-emerald-500/10 p-4 rounded-full mb-6">
        <CheckCircle2 className="size-16 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        Thank you. Your child&apos;s tuition payment has been securely processed and your invoice is being updated.
      </p>
      
      <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 py-2 px-4 rounded-full">
        <Loader2 className="size-4 animate-spin text-primary" />
        Redirecting you back to billing...
      </div>
    </div>
  );
}