"use client";

import { createContext, useContext, ReactNode } from "react";
import { Global, OpeningHours, SocialMediaAccount } from "@/lib/directus";

interface ContactInfo {
  phone: string;
  email: string;
  address: string[];
  openingHours: OpeningHours[];
  socialMedia: SocialMediaAccount[];
}

interface GlobalContextType {
  global: Global | null;
  contact: ContactInfo;
}

const defaultContact: ContactInfo = {
  phone: "",
  email: "",
  address: [],
  openingHours: [],
  socialMedia: [],
};

const GlobalContext = createContext<GlobalContextType>({
  global: null,
  contact: defaultContact,
});

export function GlobalProvider({
  children,
  global,
}: {
  children: ReactNode;
  global: Global | null;
}) {
  const addressLines = global?.address
    ? global.address.split("\n").filter((line) => line.trim())
    : defaultContact.address;

  const contact: ContactInfo = {
    phone: global?.phone ?? defaultContact.phone,
    email: global?.email_address ?? defaultContact.email,
    address: addressLines,
    openingHours: global?.opening_hours ?? defaultContact.openingHours,
    socialMedia: global?.social_media_accounts ?? defaultContact.socialMedia,
  };

  return (
    <GlobalContext.Provider value={{ global, contact }}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}
