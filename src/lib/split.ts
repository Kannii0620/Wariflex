import type { Participant, Payment } from '../store';

export type SplitResult = Participant & { payAmount: number };

// 割合から各自の支払額を計算する（端数は最大剰余方式で配分し、合計を total に一致させる）
export const calculateSplit = (total: number, participants: Participant[] | undefined): SplitResult[] => {
  if (!participants || participants.length === 0) return [];

  const totalPercentage = participants.reduce((sum, p) => sum + p.percentage, 0);
  if (totalPercentage <= 0) return participants.map(p => ({ ...p, payAmount: 0 }));

  const rawData = participants.map(p => {
    const rawVal = total * (p.percentage / totalPercentage);
    const intVal = Math.floor(rawVal);
    return { participant: p, intVal, decimalPart: rawVal - intVal };
  });

  const remainder = total - rawData.reduce((acc, d) => acc + d.intVal, 0);
  const bonusIds = new Set(
    [...rawData]
      .sort((a, b) => b.decimalPart - a.decimalPart)
      .slice(0, remainder)
      .map(d => d.participant.id)
  );

  return rawData.map(d => ({
    ...d.participant,
    payAmount: d.intVal + (bonusIds.has(d.participant.id) ? 1 : 0),
  }));
};

const escapeCsv = (value: string | number) => {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

export const downloadSplitCsv = (payment: Payment, suffix: string) => {
  const headers = ["参加者名", "割合(%)", "支払額(円)"];
  const rows = calculateSplit(payment.totalAmount, payment.participants).map(p =>
    [p.name, p.percentage, p.payAmount].map(escapeCsv).join(",")
  );
  const csvString = [headers.join(","), ...rows].join("\n");
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${payment.title}_${suffix}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
