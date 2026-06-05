import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type InvoiceData = {
  transactionId: string;
  paymentDate: string;
  dueDate: string;
  freelancerName: string;
  freelancerEmail: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  description: string | null;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
};

function fmtRM(amount: number): string {
  return `RM ${amount.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

export async function generateInvoice(data: InvoiceData): Promise<Uint8Array> {
  const invoiceNumber = `INV-${data.transactionId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const purple = rgb(0.427, 0.157, 0.855);
  const lightPurple = rgb(0.949, 0.929, 1.0);
  const black = rgb(0.08, 0.08, 0.08);
  const gray = rgb(0.45, 0.45, 0.45);
  const lineGray = rgb(0.878, 0.878, 0.878);
  const white = rgb(1, 1, 1);

  // ── Purple header band ──
  page.drawRectangle({ x: 0, y: height - 88, width, height: 88, color: purple });

  // Logo
  page.drawText("KREATO", {
    x: 40,
    y: height - 54,
    size: 26,
    font: bold,
    color: white,
  });

  // Invoice label
  page.drawText("INVOICE", {
    x: width - 145,
    y: height - 38,
    size: 13,
    font: bold,
    color: white,
  });
  page.drawText(invoiceNumber, {
    x: width - 145,
    y: height - 57,
    size: 9,
    font: regular,
    color: rgb(0.8, 0.77, 1),
  });

  // ── Billing section ──
  const col1 = 40;
  const col2 = 310;
  let y = height - 112;

  page.drawText("BILLED TO", { x: col1, y, size: 7.5, font: bold, color: gray });
  page.drawText("FROM", { x: col2, y, size: 7.5, font: bold, color: gray });

  y -= 17;
  page.drawText(truncate(data.clientName, 34), { x: col1, y, size: 11, font: bold, color: black });
  page.drawText(truncate(data.freelancerName, 34), { x: col2, y, size: 11, font: bold, color: black });

  y -= 14;
  page.drawText(truncate(data.clientEmail, 38), { x: col1, y, size: 9, font: regular, color: gray });
  page.drawText(truncate(data.freelancerEmail, 38), { x: col2, y, size: 9, font: regular, color: gray });

  // ── Date row ──
  y -= 28;
  page.drawText("Payment date", { x: col1, y, size: 8, font: bold, color: gray });
  page.drawText(data.paymentDate, { x: col1 + 85, y, size: 8, font: regular, color: black });

  page.drawText("Due date", { x: col2, y, size: 8, font: bold, color: gray });
  page.drawText(data.dueDate, { x: col2 + 60, y, size: 8, font: regular, color: black });

  // ── Project section ──
  y -= 32;
  page.drawText("PROJECT", { x: col1, y, size: 7.5, font: bold, color: gray });

  y -= 16;
  page.drawText(truncate(data.projectName, 60), { x: col1, y, size: 13, font: bold, color: black });

  if (data.description) {
    y -= 16;
    // simple truncated single-line description
    page.drawText(truncate(data.description, 80), {
      x: col1,
      y,
      size: 9,
      font: regular,
      color: gray,
    });
  }

  // ── Divider ──
  y -= 22;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: lineGray });

  // ── Table header ──
  y -= 22;
  page.drawText("DESCRIPTION", { x: col1, y, size: 8, font: bold, color: gray });
  page.drawText("AMOUNT", { x: width - 110, y, size: 8, font: bold, color: gray });

  // ── Line: service ──
  y -= 22;
  page.drawText(truncate(data.projectName, 55), { x: col1, y, size: 10, font: regular, color: black });
  const grossStr = fmtRM(data.grossAmount);
  page.drawText(grossStr, {
    x: width - 40 - bold.widthOfTextAtSize(grossStr, 10),
    y,
    size: 10,
    font: regular,
    color: black,
  });

  // ── Line: fee ──
  y -= 18;
  page.drawText("Kreato platform fee (5% + RM 1.00)", { x: col1, y, size: 9, font: regular, color: gray });
  const feeStr = `−${fmtRM(data.feeAmount)}`;
  page.drawText(feeStr, {
    x: width - 40 - regular.widthOfTextAtSize(feeStr, 9),
    y,
    size: 9,
    font: regular,
    color: gray,
  });

  // ── Divider ──
  y -= 16;
  page.drawLine({ start: { x: 40, y }, end: { x: width - 40, y }, thickness: 0.5, color: lineGray });

  // ── Net received highlight ──
  y -= 36;
  page.drawRectangle({ x: 36, y: y - 10, width: width - 72, height: 36, color: lightPurple });

  page.drawText("NET RECEIVED", { x: col1 + 4, y: y + 2, size: 10, font: bold, color: purple });
  const netStr = fmtRM(data.netAmount);
  page.drawText(netStr, {
    x: width - 44 - bold.widthOfTextAtSize(netStr, 13),
    y: y + 1,
    size: 13,
    font: bold,
    color: purple,
  });

  // ── Footer ──
  page.drawLine({ start: { x: 40, y: 56 }, end: { x: width - 40, y: 56 }, thickness: 0.5, color: lineGray });

  const footer = "Powered by Kreato · Secured by Stripe";
  const footerW = regular.widthOfTextAtSize(footer, 8.5);
  page.drawText(footer, {
    x: (width - footerW) / 2,
    y: 38,
    size: 8.5,
    font: regular,
    color: gray,
  });

  return pdfDoc.save();
}
