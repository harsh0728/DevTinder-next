"use client";

import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";

// ✅ tell TypeScript window.Razorpay exists — loaded via script tag
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
  handler: () => void;
}

interface PremiumVerifyResponse {
  success: boolean;
  message: string;
  isPremium: boolean;
}

interface OrderResponse {
  success: boolean;
  data: {
    amount: number;
    keyId: string;
    currency: string;
    orderId: string;
    notes: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export default function PremiumPage() {
  const [isUserPremium, setIsUserPremium] = useState(false);

  useEffect(() => {
    verifyPremiumUser();
    // ✅ load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await apiFetch<PremiumVerifyResponse>("/payment/premium/verify");
      if (res.isPremium) {
        setIsUserPremium(true);
      }
    } catch (error) {
      console.error("Error fetching premium user: ", error);
    }
  };

  const handleBuyClick = async (type: "gold" | "silver") => {
    try {
      const order = await apiFetch<OrderResponse>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({ membershipType: type }),
      });

      const { amount, keyId, currency, notes, orderId } = order?.data;

      const options: RazorpayOptions = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Dev Tinder",
        description: "Connect to other developers",
        order_id: orderId,
        prefill: {
          name: notes?.firstName + " " + notes?.lastName,
          email: notes?.email,
          contact: "9999999999",
        },
        theme: { color: "#F37254" },
        handler: verifyPremiumUser,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error purchasing membership:", error);
    }
  };

  if (isUserPremium) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-6xl mb-4">👑</div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            You are already a Premium Member!
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2">
        Upgrade to Premium
      </h1>
      <p className="text-center text-slate-400 mb-12">
        Unlock exclusive features and connect with more developers
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Silver */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-indigo-500/20 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-indigo-500/40 transition duration-200">
          <div className="text-4xl">🥈</div>
          <h2 className="text-2xl font-bold text-white">Silver Membership</h2>
          <ul className="text-slate-300 space-y-2 w-full">
            <li className="flex items-center gap-2">✅ Chat with other people</li>
            <li className="flex items-center gap-2">✅ 100 connection requests per day</li>
            <li className="flex items-center gap-2">✅ Blue Tick</li>
            <li className="flex items-center gap-2">✅ 3 months</li>
          </ul>
          <button
            onClick={() => handleBuyClick("silver")}
            className="w-full py-3 rounded-lg border border-indigo-500/40 hover:bg-indigo-500/20 text-indigo-300 font-semibold transition duration-200"
          >
            Buy Silver
          </button>
        </div>

        {/* Gold */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 flex flex-col items-center gap-6 hover:border-cyan-500/50 transition duration-200">
          <div className="text-4xl">🥇</div>
          <h2 className="text-2xl font-bold text-white">Gold Membership</h2>
          <ul className="text-slate-300 space-y-2 w-full">
            <li className="flex items-center gap-2">✅ Chat with other people</li>
            <li className="flex items-center gap-2">✅ Infinite connection requests per day</li>
            <li className="flex items-center gap-2">✅ Blue Tick</li>
            <li className="flex items-center gap-2">✅ 6 months</li>
          </ul>
          <button
            onClick={() => handleBuyClick("gold")}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold transition duration-200"
          >
            Buy Gold
          </button>
        </div>

      </div>
    </div>
  );
}