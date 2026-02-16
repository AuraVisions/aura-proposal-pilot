import { Proposal } from '../types';
import { FIELD_LABELS } from '../constants';

export const downloadProposalPDF = async (proposal: Proposal) => {
  // @ts-ignore - jsPDF is loaded via CDN
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 40;

  // --- COVER PAGE ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AURA PROPOSAL PILOT', margin, 35);
  
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(32);
  doc.text(proposal.title.toUpperCase(), margin, 90);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`Client: ${proposal.clientName}`, margin, 110);
  doc.text(`Status: ${proposal.status}`, margin, 120);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 130);
  
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 145, pageWidth - margin, 145);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('This document contains confidential digital transformation strategies and project scopes.', margin, 160);
  doc.text('All phases have been formally reviewed and approved by both parties.', margin, 165);

  // --- CONTENT PAGES ---
  proposal.phases.forEach((phase, index) => {
    doc.addPage();
    yPos = 30;

    // Phase Header
    doc.setFillColor(241, 245, 249); // bg-slate-100
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(phase.title, margin, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    if (phase.approvalTimestamp) {
        doc.text(`Approved on ${new Date(phase.approvalTimestamp).toLocaleString()} by ${phase.approvedBy || 'Authorized Signatory'}`, margin, 40);
    }

    yPos = 70;

    // Phase Fields
    Object.keys(phase.fields).forEach((fieldKey) => {
      const label = FIELD_LABELS[fieldKey] || fieldKey;
      const content = phase.fields[fieldKey] || 'N/A';

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(label, margin, yPos);
      yPos += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      const splitText = doc.splitTextToSize(content, pageWidth - (margin * 2));
      
      // Page break check
      if (yPos + (splitText.length * 7) > 280) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(splitText, margin, yPos);
      yPos += (splitText.length * 7) + 15;
    });
  });

  // Save the PDF
  const filename = `${proposal.clientName.replace(/\s+/g, '_')}_Proposal_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};