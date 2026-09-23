"use client";

import { createContext, useContext, ReactNode } from "react";
import { Global, SocialMediaAccount } from "@/lib/directus";

interface ContactInfo {
  phone: string;
  email: string;
  address: string[];
  officeHours: {
    days: string;
    times: string;
  };
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
  officeHours: {
    days: "Mon-Fri",
    times: "9am-5pm",
  },
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
    officeHours: {
      days: global?.office_hours_days ?? defaultContact.officeHours.days,
      times: global?.office_hours_times ?? defaultContact.officeHours.times,
    },
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
