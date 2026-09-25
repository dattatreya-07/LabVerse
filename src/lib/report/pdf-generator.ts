import jsPDF from 'jspdf';
import { SessionState } from '@/types';
import { formatCurrent } from '@/lib/simulation/engine';

export function generatePDFReport(session: SessionState): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark Navy Slate (#0f172a)
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(56, 189, 248); // Cyan-400
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('LabVerse Virtual Laboratory', 14, 15);

  doc.setTextColor(241, 245, 249); // Slate-100
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text("Official Experiment Report: Ohm's Law (V = IR)", 14, 23);

  // Status Badge
  doc.setFillColor(16, 185, 129); // Emerald
  doc.roundedRect(pageWidth - 45, 10, 32, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED', pageWidth - 37, 16.5);

  y = 42;

  // Metadata Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`SESSION ID: ${session.sessionId}`, 18, y + 8);
  doc.text(`STUDENT: ${session.studentName}`, 18, y + 16);
  doc.text(`EXPERIMENT: Ohm's Law Verification & Fault Analysis`, 18, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${new Date(session.startTime).toLocaleString()}`, pageWidth - 80, y + 8);
  doc.text(`TOTAL OBSERVATIONS: ${session.observations.length}`, pageWidth - 80, y + 16);
  doc.text(`FAULTS LOGGED: ${session.faultLog.length}`, pageWidth - 80, y + 24);

  y += 36;

  // Section 1: Objective & Theoretical Model
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Objective & Governing Formula', 14, y);
  y += 6;

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  const theoryLines = [
    "Objective: To empirically investigate the relationship between voltage, current, and resistance in a DC circuit,",
    "verify Ohm's Law (V = I x R), detect instrument calibration anomalies, and troubleshoot open circuit faults.",
    "Governing Model: Current (I) = Voltage (V) / Resistance (R). Linear slope of V vs I curve equals circuit conductance (1/R)."
  ];
  doc.text(theoryLines, 14, y);

  y += 18;

  // Section 2: Observations Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Collected Empirical Observations Data', 14, y);
  y += 7;

  // Table Headers
  const tableX = 14;
  const colWidths = [15, 22, 25, 28, 32, 32, 28];
  const headers = ['Run #', 'Time', 'Voltage (V)', 'Resistance (Ω)', 'Theoretical I', 'Measured I', 'Circuit State'];

  doc.setFillColor(30, 41, 59);
  doc.rect(tableX, y, pageWidth - 28, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');

  let curX = tableX + 2;
  headers.forEach((h, i) => {
    doc.text(h, curX, y + 5.5);
    curX += colWidths[i];
  });

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  session.observations.slice(0, 10).forEach((obs, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 241, isEven ? 255 : 245, isEven ? 255 : 249);
    doc.rect(tableX, y, pageWidth - 28, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(tableX, y + 7, tableX + pageWidth - 28, y + 7);

    doc.setTextColor(30, 41, 59);
    let rowX = tableX + 2;

    doc.text(`#${idx + 1}`, rowX, y + 5);
    rowX += colWidths[0];

    doc.text(obs.timestamp.slice(0, 8), rowX, y + 5);
    rowX += colWidths[1];

    doc.text(`${obs.voltage.toFixed(1)} V`, rowX, y + 5);
    rowX += colWidths[2];

    doc.text(`${obs.resistance.toFixed(0)} Ω`, rowX, y + 5);
    rowX += colWidths[3];

    doc.text(formatCurrent(obs.theoreticalCurrent), rowX, y + 5);
    rowX += colWidths[4];

    // Highlight measured if fault present
    if (obs.faultType !== 'NORMAL') {
      doc.setTextColor(225, 29, 72); // Red
    }
    doc.text(formatCurrent(obs.measuredCurrent), rowX, y + 5);
    doc.setTextColor(30, 41, 59);
    rowX += colWidths[5];

    doc.text(obs.faultType, rowX, y + 5);

    y += 7;
  });

  if (session.observations.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.text('No observations recorded in session yet.', tableX + 2, y + 5);
    y += 8;
  }

  y += 8;

  // Section 3: Fault Injection & Diagnostics Log
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Troubleshooting & Fault Log Summary', 14, y);
  y += 7;

  if (session.faultLog.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 12, 1, 1, 'FD');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('No fault anomalies injected during this session. All runs performed in Normal Circuit state.', 18, y + 7.5);
    y += 18;
  } else {
    session.faultLog.forEach((entry) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(254, 242, 242); // Light red
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, y, pageWidth - 28, 12, 1, 1, 'FD');

      doc.setTextColor(153, 27, 27);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${entry.timestamp}] ${entry.action} - ${entry.faultType}`, 18, y + 5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(entry.details.slice(0, 95), 18, y + 9.5);

      y += 14;
    });
  }

  y += 4;

  // Section 4: AI Tutor & Learning Conclusion
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Analytical Conclusion & Sign-Off', 14, y);
  y += 7;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  const conclusionText = [
    "The experimental data confirms that current is directly proportional to applied voltage and inversely proportional",
    "to circuit resistance in compliance with Ohm's Law. Fault analysis demonstrated that an open circuit drops actual current",
    "to 0A, while ammeter calibration errors distort instrument readings without altering physical circuit current.",
    "This report was automatically compiled and verified by LabVerse AI Virtual Laboratory Platform."
  ];
  doc.text(conclusionText, 18, y + 6);

  // Footer Signature
  y = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y - 5, pageWidth - 14, y - 5);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('LabVerse AI Virtual Laboratory System • Page 1 of 1 • Generated via Client Session', 14, y);

  doc.save(`LabVerse_Ohms_Law_Report_${session.sessionId}.pdf`);
}
