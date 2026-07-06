import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { getCoverPageFields, getStandardTermsClauses } from "@/lib/ndaContent";
import { NdaFormData, partyFieldOrPlaceholder } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    lineHeight: 1.4,
    fontFamily: "Helvetica",
  },
  h1: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
  },
  h2: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginTop: 16,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: "Helvetica-Bold",
    width: 140,
  },
  fieldValue: {
    flex: 1,
  },
  paragraph: {
    marginBottom: 8,
  },
  clauseTitle: {
    fontFamily: "Helvetica-Bold",
  },
  table: {
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableCellLabel: {
    width: 110,
    padding: 4,
    fontFamily: "Helvetica-Bold",
    borderRightWidth: 1,
    borderColor: "#333",
  },
  tableCell: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#333",
  },
  tableCellLast: {
    flex: 1,
    padding: 4,
  },
  footer: {
    marginTop: 16,
    fontSize: 8,
    color: "#666",
  },
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function SignatureRow({
  label,
  party1,
  party2,
  last,
}: {
  label: string;
  party1: string;
  party2: string;
  last?: boolean;
}) {
  return (
    <View style={last ? styles.tableRowLast : styles.tableRow}>
      <Text style={styles.tableCellLabel}>{label}</Text>
      <Text style={styles.tableCell}>{party1}</Text>
      <Text style={styles.tableCellLast}>{party2}</Text>
    </View>
  );
}

export default function NdaPdfDocument({ data }: { data: NdaFormData }) {
  const cover = getCoverPageFields(data);
  const clauses = getStandardTermsClauses(data);

  return (
    <Document title="Mutual Non-Disclosure Agreement">
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.h1}>Mutual Non-Disclosure Agreement</Text>

        <Text style={styles.h2}>Cover Page</Text>
        <Field label="Purpose" value={cover.purpose} />
        <Field label="Effective Date" value={cover.effectiveDate} />
        <Field label="MNDA Term" value={cover.mndaTerm} />
        <Field
          label="Term of Confidentiality"
          value={cover.confidentialityTerm}
        />
        <Field label="Governing Law" value={cover.governingLawState} />
        <Field label="Jurisdiction" value={cover.jurisdiction} />

        <Text style={styles.paragraph}>
          By signing this Cover Page, each party agrees to enter into this
          MNDA as of the Effective Date.
        </Text>

        <View style={styles.table}>
          <SignatureRow
            label=""
            party1="Party 1"
            party2="Party 2"
          />
          <SignatureRow label="Signature" party1="" party2="" />
          <SignatureRow
            label="Print Name"
            party1={partyFieldOrPlaceholder(data.party1, "name")}
            party2={partyFieldOrPlaceholder(data.party2, "name")}
          />
          <SignatureRow
            label="Title"
            party1={partyFieldOrPlaceholder(data.party1, "title")}
            party2={partyFieldOrPlaceholder(data.party2, "title")}
          />
          <SignatureRow
            label="Company"
            party1={partyFieldOrPlaceholder(data.party1, "company")}
            party2={partyFieldOrPlaceholder(data.party2, "company")}
          />
          <SignatureRow
            label="Notice Address"
            party1={partyFieldOrPlaceholder(data.party1, "noticeAddress")}
            party2={partyFieldOrPlaceholder(data.party2, "noticeAddress")}
          />
          <SignatureRow label="Date" party1="" party2="" last />
        </View>

        <Text style={styles.h2}>Standard Terms</Text>
        {clauses.map((clause) => (
          <Text style={styles.paragraph} key={clause.number}>
            <Text style={styles.clauseTitle}>
              {clause.number}. {clause.title}.{" "}
            </Text>
            {clause.body}
          </Text>
        ))}

        <Text style={styles.footer}>
          Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to
          use under CC BY 4.0 (creativecommons.org/licenses/by/4.0).
        </Text>
      </Page>
    </Document>
  );
}
