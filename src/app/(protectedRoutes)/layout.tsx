import React from "react";
import { onAuthenticateUser } from "../actions/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/ReuseableComponents/LayoutComponents/Sidebar";
import Header from "@/components/ReuseableComponents/LayoutComponents/Header";
import { getAllProductsFromStripe } from "../actions/stripe";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const userExist = await onAuthenticateUser();
  if (!userExist.user) {
    redirect("/sign-in");
  }
  const stripeProducts = await getAllProductsFromStripe();
  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-auto px-4 scrollbar-hide container mx-auto">
        <Header
          user={userExist.user}
          stripeProducts={stripeProducts.products || []}
        />
        <div className="flex-1 py-10">{children}</div>
      </div>
    </div>
  );
};
export default Layout;
