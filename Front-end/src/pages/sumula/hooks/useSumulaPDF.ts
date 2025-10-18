import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SumulaData } from '../../../components/features/sumula/types';

interface UseSumulaPDFReturn {
  exportPDF: (data: SumulaData, matchType: string) => void;
}

export const useSumulaPDF = (): UseSumulaPDFReturn => {
  const exportPDF = useCallback((data: SumulaData, matchType: string) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Súmula da Partida', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Tipo: ${matchType}`, 20, 30);
    doc.text(`Data: ${data.matchDate || 'Não informada'}`, 20, 38);
    doc.text(`Local: ${data.matchLocation || 'Não informado'}`, 20, 46);

    doc.setFontSize(16);
    doc.text('Placar', 105, 60, { align: 'center' });
    
    doc.setFontSize(14);
    const scoreText = `${data.homeTeamName} ${data.homeScore} x ${data.awayScore} ${data.awayTeamName}`;
    doc.text(scoreText, 105, 70, { align: 'center' });

    if (data.goals.length > 0) {
      autoTable(doc, {
        startY: 85,
        head: [['Jogador', 'Time', 'Minuto']],
        body: data.goals.map(goal => [
          goal.playerName,
          goal.teamName,
          `${goal.minute}'`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 20, right: 20 }
      });
    } else {
      doc.setFontSize(11);
      doc.text('Nenhum gol registrado', 20, 90);
    }

    const finalY = data.goals.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : 100;

    doc.setFontSize(14);
    doc.text('Cartões', 20, finalY);

    if (data.cards.length > 0) {
      autoTable(doc, {
        startY: finalY + 5,
        head: [['Jogador', 'Time', 'Tipo', 'Minuto']],
        body: data.cards.map(card => [
          card.playerName,
          card.teamName,
          card.type,
          `${card.minute}'`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 20, right: 20 }
      });
    } else {
      doc.setFontSize(11);
      doc.text('Nenhum cartão registrado', 20, finalY + 10);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `sumula_${data.homeTeamName}_vs_${data.awayTeamName}_${timestamp}.pdf`;
    
    doc.save(filename);
  }, []);

  return { exportPDF };
};
