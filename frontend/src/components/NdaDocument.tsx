import { getCoverPageFields, getStandardTermsClauses } from "@/lib/ndaContent";
import { NdaFormData, Party, partyFieldOrPlaceholder } from "@/lib/types";

function SignatureTable({
  party1,
  party2,
}: {
  party1: Party;
  party2: Party;
}) {
  const rows: { label: string; field: keyof Party }[] = [
    { label: "Print Name", field: "name" },
    { label: "Title", field: "title" },
    { label: "Company", field: "company" },
    { label: "Notice Address", field: "noticeAddress" },
  ];

  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr>
          <th className="border border-zinc-300 p-2 text-left dark:border-zinc-700"></th>
          <th className="border border-zinc-300 p-2 text-left dark:border-zinc-700">
            Party 1
          </th>
          <th className="border border-zinc-300 p-2 text-left dark:border-zinc-700">
            Party 2
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-zinc-300 p-2 font-medium dark:border-zinc-700">
            Signature
          </td>
          <td className="border border-zinc-300 p-2 dark:border-zinc-700"></td>
          <td className="border border-zinc-300 p-2 dark:border-zinc-700"></td>
        </tr>
        {rows.map(({ label, field }) => (
          <tr key={field}>
            <td className="border border-zinc-300 p-2 font-medium dark:border-zinc-700">
              {label}
            </td>
            <td className="border border-zinc-300 p-2 dark:border-zinc-700">
              {partyFieldOrPlaceholder(party1, field)}
            </td>
            <td className="border border-zinc-300 p-2 dark:border-zinc-700">
              {partyFieldOrPlaceholder(party2, field)}
            </td>
          </tr>
        ))}
        <tr>
          <td className="border border-zinc-300 p-2 font-medium dark:border-zinc-700">
            Date
          </td>
          <td className="border border-zinc-300 p-2 dark:border-zinc-700"></td>
          <td className="border border-zinc-300 p-2 dark:border-zinc-700"></td>
        </tr>
      </tbody>
    </table>
  );
}

export default function NdaDocument({ data }: { data: NdaFormData }) {
  const cover = getCoverPageFields(data);
  const clauses = getStandardTermsClauses(data);

  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <h1>Mutual Non-Disclosure Agreement</h1>

      <h2>Cover Page</h2>
      <p>
        <strong>Purpose:</strong> {cover.purpose}
      </p>
      <p>
        <strong>Effective Date:</strong> {cover.effectiveDate}
      </p>
      <p>
        <strong>MNDA Term:</strong> {cover.mndaTerm}
      </p>
      <p>
        <strong>Term of Confidentiality:</strong> {cover.confidentialityTerm}
      </p>
      <p>
        <strong>Governing Law:</strong> {cover.governingLawState}
      </p>
      <p>
        <strong>Jurisdiction:</strong> {cover.jurisdiction}
      </p>

      <p>
        By signing this Cover Page, each party agrees to enter into this MNDA
        as of the Effective Date.
      </p>

      <SignatureTable party1={data.party1} party2={data.party2} />

      <h2>Standard Terms</h2>
      {clauses.map((clause) => (
        <p key={clause.number}>
          <strong>
            {clause.number}. {clause.title}.
          </strong>{" "}
          {clause.body}
        </p>
      ))}

      <p className="text-sm text-zinc-500">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use
        under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>.
      </p>
    </article>
  );
}
