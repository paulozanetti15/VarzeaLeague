// @ts-ignore - tipos serão resolvidos via dependência
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PlayerStats {
  nome: string;
  posicao?: string;
  sexo?: string;
  gols: number;
  amarelos: number;
  vermelhos: number;
}

export const generateTeamPlayersPDF = (teamName: string, playerStats: PlayerStats[]) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(`Relatório de Jogadores - ${teamName}`, margin, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  const dateStr = new Date().toLocaleString();
  doc.text(`Gerado em: ${dateStr}`, margin, 70);

  // Linha divisória sutil
  doc.setDrawColor(200);
  doc.line(margin, 78, 555, 78);

  // Table data
  const headers = [['Jogador', 'Posição', 'Sexo', 'Gols', 'Cartões Amarelo', 'Cartões Vermelho']];
  const body = playerStats.map((p) => [
    p.nome || '-',
    p.posicao || '-',
    p.sexo || '-',
    String(p.gols || 0),
    String(p.amarelos || 0),
    String(p.vermelhos || 0)
  ]);

  autoTable(doc, {
    head: headers,
    body,
    startY: 90,
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 6, halign: 'center' },
    headStyles: { fillColor: [25, 118, 210], textColor: 255, halign: 'center' },
    columnStyles: {
      0: { cellWidth: 180 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
    }
  });

  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string) => {
  try {
    doc.save(filename);
  } catch (err) {
    // Fallback manual
    try {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Falha ao iniciar download do PDF:', e);
      throw new Error('Falha ao fazer download do PDF');
    }
  }
};

export const generateTeamPlayersFilename = (teamName: string) => {
  return `relatorio-jogadores-${teamName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
};