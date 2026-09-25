import jsPDF from 'jspdf';
import { ExperimentSession, ExperimentDefinition } from '@/types';

export function generateGenericPDFReport(session: ExperimentSession, experiment: ExperimentDefinition): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(56, 189, 248); // Cyan-400
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LabVerse AI Virtual Laboratory Platform', 14, 15);

  doc.setTextColor(241, 245, 249);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Experiment Report: ${experiment.title}`, 14, 23);

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(pageWidth - 45, 10, 32, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('VERIFIED', pageWidth - 37, 16.5);

  y = 42;

  // Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`SESSION ID: ${session.sessionId}`, 18, y + 8);
  doc.text(`STUDENT: ${session.studentName}`, 18, y + 16);
  doc.text(`DOMAIN: ${experiment.domain}`, 18, y + 24);

  doc.setFont('helvetica', 'normal');
  doc.text(`DATE: ${new Date(session.startTime).toLocaleString()}`, pageWidth - 80, y + 8);
  doc.text(`OBSERVATIONS: ${session.observations.length} Runs`, pageWidth - 80, y + 16);
  doc.text(`FAULTS LOGGED: ${session.faultLog.length}`, pageWidth - 80, y + 24);

  y += 36;

  // Section 1: Objective & Governing Formula
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Objective & Governing Formula', 14, y);
  y += 6;

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Objective: ${experiment.learningObjectives.map(o => o.description).join(' ')}`, 14, y, { maxWidth: pageWidth - 28 });

  y += 14;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 10, 2, 2, 'F');
  doc.setTextColor(2, 132, 199);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Governing Model: ${experiment.report.governingFormulaLatex}`, 18, y + 6.5);

  y += 18;

  // Section 2: Observations Dataset Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`2. Empirical Observations Dataset (${session.observations.length} Runs)`, 14, y);
  y += 6;

  if (session.observations.length > 0) {
    const tableX = 14;
    const colWidths = [15, 22, 28, 28, 32, 32, 25];
    const headers = ['Run #', 'Time', 'Param 1', 'Param 2', 'Theoretical', 'Observed', 'State'];

    doc.setFillColor(30, 41, 59);
    doc.rect(tableX, y, pageWidth - 28, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');

    let curX = tableX + 2;
    headers.forEach((h, i) => {
      doc.text(h, curX, y + 5.5);
      curX += colWidths[i];
    });

    y += 8;

    session.observations.slice(0, 10).forEach((obs, idx) => {
      const isEven = idx % 2 === 0;
      doc.setFillColor(isEven ? 255 : 241, isEven ? 255 : 245, isEven ? 255 : 249);
      doc.rect(tableX, y, pageWidth - 28, 7, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(tableX, y + 7, tableX + pageWidth - 28, y + 7);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      const pKeys = Object.keys(obs.parameters);
      const mKeys = Object.keys(obs.measurements);

      let rowX = tableX + 2;
      doc.text(`#${idx + 1}`, rowX, y + 5);
      rowX += colWidths[0];

      doc.text(obs.timestamp.slice(0, 8), rowX, y + 5);
      rowX += colWidths[1];

      doc.text(`${pKeys[0] ? obs.parameters[pKeys[0]] : '-'}`, rowX, y + 5);
      rowX += colWidths[2];

      doc.text(`${pKeys[1] ? obs.parameters[pKeys[1]] : '-'}`, rowX, y + 5);
      rowX += colWidths[3];

      doc.text(`${mKeys[0] ? obs.theoreticalValues[mKeys[0]] : '-'}`, rowX, y + 5);
      rowX += colWidths[4];

      if (obs.faultsActive.length > 0) {
        doc.setTextColor(225, 29, 72);
      }
      doc.text(`${mKeys[0] ? obs.measurements[mKeys[0]] : '-'}`, rowX, y + 5);
      doc.setTextColor(30, 41, 59);
      rowX += colWidths[5];

      doc.text(obs.faultsActive.length === 0 ? 'NORMAL' : 'FAULT', rowX, y + 5);

      y += 7;
    });
  } else {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8.5);
    doc.text('No observations recorded in this session.', 14, y + 5);
    y += 10;
  }

  y += 10;

  // Section 3: Fault Diagnostics Log
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Fault Diagnostics & Incident Log', 14, y);
  y += 6;

  if (session.faultLog.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 10, 1, 1, 'FD');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('No fault anomalies recorded. Experiment performed under nominal conditions.', 18, y + 6.5);
    y += 16;
  } else {
    session.faultLog.forEach((entry) => {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, y, pageWidth - 28, 12, 1, 1, 'FD');

      doc.setTextColor(153, 27, 27);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${entry.timestamp}] ${entry.action} - ${entry.faultTitle}`, 18, y + 5);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(entry.details.slice(0, 95), 18, y + 9.5);

      y += 14;
    });
  }

  y += 6;

  // Section 4: Analytical Conclusion
  if (y > 230) {
    doc.addPage();
    y = 20;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Scientific Analysis & Verified Conclusion', 14, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(experiment.report.expectedConclusionTemplate, 18, y + 6, { maxWidth: pageWidth - 36 });

  // Footer Signature
  y = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y - 4, pageWidth - 14, y - 4);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text(`LabVerse AI Virtual Laboratory • Verified Session • Experiment ID: ${experiment.id}`, 14, y);

  doc.save(`LabVerse_${experiment.id}_Report_${session.sessionId}.pdf`);
}
