"use client";

import { cloneElement, isValidElement, useId } from "react";
import { NdaFormData, Party } from "@/lib/types";

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const labelClass =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactElement<{ id?: string }>;
}) {
  const id = useId();
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      {isValidElement(children) ? cloneElement(children, { id }) : children}
    </div>
  );
}

function PartyFields({
  legend,
  party,
  onChange,
}: {
  legend: string;
  party: Party;
  onChange: (party: Party) => void;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {legend}
      </legend>
      <Field label="Print Name">
        <input
          className={inputClass}
          value={party.name}
          onChange={(e) => onChange({ ...party, name: e.target.value })}
        />
      </Field>
      <Field label="Title">
        <input
          className={inputClass}
          value={party.title}
          onChange={(e) => onChange({ ...party, title: e.target.value })}
        />
      </Field>
      <Field label="Company">
        <input
          className={inputClass}
          value={party.company}
          onChange={(e) => onChange({ ...party, company: e.target.value })}
        />
      </Field>
      <Field label="Notice Address">
        <input
          className={inputClass}
          value={party.noticeAddress}
          onChange={(e) =>
            onChange({ ...party, noticeAddress: e.target.value })
          }
        />
      </Field>
    </fieldset>
  );
}

export default function NdaForm({
  data,
  onChange,
}: {
  data: NdaFormData;
  onChange: (data: NdaFormData) => void;
}) {
  return (
    <form className="space-y-6">
      <Field label="Purpose">
        <textarea
          className={inputClass}
          rows={2}
          placeholder="Evaluating whether to enter into a business relationship with the other party."
          value={data.purpose}
          onChange={(e) => onChange({ ...data, purpose: e.target.value })}
        />
      </Field>

      <Field label="Effective Date">
        <input
          type="date"
          className={inputClass}
          value={data.effectiveDate}
          onChange={(e) =>
            onChange({ ...data, effectiveDate: e.target.value })
          }
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className={labelClass}>MNDA Term</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="mndaTerm"
            checked={data.mndaTerm.type === "expires"}
            onChange={() =>
              onChange({ ...data, mndaTerm: { type: "expires", years: "1" } })
            }
          />
          Expires
          <input
            type="number"
            min="0"
            className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={data.mndaTerm.type !== "expires"}
            value={data.mndaTerm.type === "expires" ? data.mndaTerm.years : ""}
            onChange={(e) =>
              onChange({
                ...data,
                mndaTerm: { type: "expires", years: e.target.value },
              })
            }
          />
          year(s) from Effective Date
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="mndaTerm"
            checked={data.mndaTerm.type === "continues"}
            onChange={() =>
              onChange({ ...data, mndaTerm: { type: "continues" } })
            }
          />
          Continues until terminated in accordance with the terms of the MNDA
        </label>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className={labelClass}>Term of Confidentiality</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="confidentialityTerm"
            checked={data.confidentialityTerm.type === "years"}
            onChange={() =>
              onChange({
                ...data,
                confidentialityTerm: { type: "years", years: "1" },
              })
            }
          />
          <input
            type="number"
            min="0"
            className="w-16 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            disabled={data.confidentialityTerm.type !== "years"}
            value={
              data.confidentialityTerm.type === "years"
                ? data.confidentialityTerm.years
                : ""
            }
            onChange={(e) =>
              onChange({
                ...data,
                confidentialityTerm: { type: "years", years: e.target.value },
              })
            }
          />
          year(s) from Effective Date (trade secrets survive as required by
          law)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="confidentialityTerm"
            checked={data.confidentialityTerm.type === "perpetuity"}
            onChange={() =>
              onChange({
                ...data,
                confidentialityTerm: { type: "perpetuity" },
              })
            }
          />
          In perpetuity
        </label>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Governing Law (state)">
          <input
            className={inputClass}
            placeholder="Delaware"
            value={data.governingLawState}
            onChange={(e) =>
              onChange({ ...data, governingLawState: e.target.value })
            }
          />
        </Field>
        <Field label="Jurisdiction">
          <input
            className={inputClass}
            placeholder="courts located in New Castle, DE"
            value={data.jurisdiction}
            onChange={(e) =>
              onChange({ ...data, jurisdiction: e.target.value })
            }
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <PartyFields
          legend="Party 1"
          party={data.party1}
          onChange={(party1) => onChange({ ...data, party1 })}
        />
        <PartyFields
          legend="Party 2"
          party={data.party2}
          onChange={(party2) => onChange({ ...data, party2 })}
        />
      </div>
    </form>
  );
}
