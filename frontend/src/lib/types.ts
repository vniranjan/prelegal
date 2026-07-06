export type Party = {
  name: string;
  title: string;
  company: string;
  noticeAddress: string;
};

export type MndaTerm =
  | { type: "expires"; years: string }
  | { type: "continues" };

export type ConfidentialityTerm =
  | { type: "years"; years: string }
  | { type: "perpetuity" };

export type NdaFormData = {
  purpose: string;
  effectiveDate: string;
  mndaTerm: MndaTerm;
  confidentialityTerm: ConfidentialityTerm;
  governingLawState: string;
  jurisdiction: string;
  party1: Party;
  party2: Party;
};

export const emptyParty: Party = {
  name: "",
  title: "",
  company: "",
  noticeAddress: "",
};

export function partyFieldOrPlaceholder(party: Party, field: keyof Party) {
  return party[field].trim() || "—";
}

export const defaultFormData: NdaFormData = {
  purpose: "",
  effectiveDate: "",
  mndaTerm: { type: "expires", years: "1" },
  confidentialityTerm: { type: "years", years: "1" },
  governingLawState: "",
  jurisdiction: "",
  party1: { ...emptyParty },
  party2: { ...emptyParty },
};
