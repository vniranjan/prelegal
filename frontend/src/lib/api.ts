import { NdaFormData } from "./types";

export class ApiError extends Error {}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  return response;
}

export async function login(email: string, password: string) {
  const response = await apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new ApiError("Login failed");
  }
  return response.json() as Promise<{ id: number; email: string }>;
}

export async function logout() {
  await apiFetch("/api/logout", { method: "POST" });
}

export async function getCurrentUser() {
  const response = await apiFetch("/api/me");
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<{ id: number; email: string }>;
}

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type KnownTermFields = { mndaTerm: boolean; confidentialityTerm: boolean };

type NdaWireData = {
  purpose: string | null;
  effective_date: string | null;
  mnda_term_type: "expires" | "continues" | null;
  mnda_term_years: string | null;
  confidentiality_term_type: "years" | "perpetuity" | null;
  confidentiality_term_years: string | null;
  governing_law_state: string | null;
  jurisdiction: string | null;
  party1_name: string | null;
  party1_title: string | null;
  party1_company: string | null;
  party1_notice_address: string | null;
  party2_name: string | null;
  party2_title: string | null;
  party2_company: string | null;
  party2_notice_address: string | null;
};

const orNull = (value: string) => (value.trim() ? value : null);

function toWireData(data: NdaFormData): NdaWireData {
  return {
    purpose: orNull(data.purpose),
    effective_date: orNull(data.effectiveDate),
    mnda_term_type: data.mndaTerm.type,
    mnda_term_years: data.mndaTerm.type === "expires" ? data.mndaTerm.years : null,
    confidentiality_term_type: data.confidentialityTerm.type,
    confidentiality_term_years:
      data.confidentialityTerm.type === "years"
        ? data.confidentialityTerm.years
        : null,
    governing_law_state: orNull(data.governingLawState),
    jurisdiction: orNull(data.jurisdiction),
    party1_name: orNull(data.party1.name),
    party1_title: orNull(data.party1.title),
    party1_company: orNull(data.party1.company),
    party1_notice_address: orNull(data.party1.noticeAddress),
    party2_name: orNull(data.party2.name),
    party2_title: orNull(data.party2.title),
    party2_company: orNull(data.party2.company),
    party2_notice_address: orNull(data.party2.noticeAddress),
  };
}

export function mergeWireData(
  wire: Partial<NdaWireData>,
  previous: NdaFormData,
): NdaFormData {
  const str = (value: string | null | undefined, fallback: string) =>
    value ?? fallback;

  const mndaTerm =
    wire.mnda_term_type === "continues"
      ? { type: "continues" as const }
      : wire.mnda_term_type === "expires"
        ? {
            type: "expires" as const,
            years: str(
              wire.mnda_term_years,
              previous.mndaTerm.type === "expires"
                ? previous.mndaTerm.years
                : "1",
            ),
          }
        : previous.mndaTerm;

  const confidentialityTerm =
    wire.confidentiality_term_type === "perpetuity"
      ? { type: "perpetuity" as const }
      : wire.confidentiality_term_type === "years"
        ? {
            type: "years" as const,
            years: str(
              wire.confidentiality_term_years,
              previous.confidentialityTerm.type === "years"
                ? previous.confidentialityTerm.years
                : "1",
            ),
          }
        : previous.confidentialityTerm;

  return {
    purpose: str(wire.purpose, previous.purpose),
    effectiveDate: str(wire.effective_date, previous.effectiveDate),
    mndaTerm,
    confidentialityTerm,
    governingLawState: str(wire.governing_law_state, previous.governingLawState),
    jurisdiction: str(wire.jurisdiction, previous.jurisdiction),
    party1: {
      name: str(wire.party1_name, previous.party1.name),
      title: str(wire.party1_title, previous.party1.title),
      company: str(wire.party1_company, previous.party1.company),
      noticeAddress: str(
        wire.party1_notice_address,
        previous.party1.noticeAddress,
      ),
    },
    party2: {
      name: str(wire.party2_name, previous.party2.name),
      title: str(wire.party2_title, previous.party2.title),
      company: str(wire.party2_company, previous.party2.company),
      noticeAddress: str(
        wire.party2_notice_address,
        previous.party2.noticeAddress,
      ),
    },
  };
}

export async function sendChatMessage(
  messages: ChatMessage[],
  data: NdaFormData,
  knownTermFields: KnownTermFields,
): Promise<{ reply: string; wireData: Partial<NdaWireData> }> {
  const wireData = toWireData(data);
  if (!knownTermFields.mndaTerm) {
    wireData.mnda_term_type = null;
    wireData.mnda_term_years = null;
  }
  if (!knownTermFields.confidentialityTerm) {
    wireData.confidentiality_term_type = null;
    wireData.confidentiality_term_years = null;
  }

  const response = await apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages, data: wireData }),
  });
  if (!response.ok) {
    throw new ApiError("Chat request failed");
  }
  const body = (await response.json()) as {
    reply: string;
    data: Partial<NdaWireData>;
  };
  return { reply: body.reply, wireData: body.data };
}
