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
          goal.player || goal.playerName || '',
          goal.team || goal.teamName || 'Time não identificado',
          `${goal.minute || 0}'`
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
          card.player || card.playerName || '',
          card.team || card.teamName || 'Time não identificado',
          card.type || '',
          `${card.minute || 0}'`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 20, right: 20 }
      });
    } else {
      doc.setFontSize(11);
      doc.text('Nenhum cartão registrado', 20, finalY + 10);
    }

    // Timeline de Eventos
    const eventsFinalY = data.cards.length > 0 ? (doc as any).lastAutoTable.finalY + 10 : finalY + 20;

    doc.setFontSize(14);
    doc.text('Linha do Tempo da Partida', 20, eventsFinalY);

    // Combinar e ordenar eventos por minuto
    const events = [
      ...data.goals.map(goal => ({
        type: 'Gol',
        player: goal.player || goal.playerName || '',
        team: goal.team || goal.teamName || 'Time não identificado',
        minute: goal.minute || 0,
        marker: 'GOL',
        color: [34, 197, 94] // Verde para gols
      })),
      ...data.cards.map(card => ({
        type: 'Cartão',
        player: card.player || card.playerName || '',
        team: card.team || card.teamName || 'Time não identificado',
        minute: card.minute || 0,
        marker: (card.type === 'Amarelo' || card.type === 'yellow') ? 'AMR' : 'VRM',
        color: (card.type === 'Amarelo' || card.type === 'yellow') ? [255, 193, 7] : [220, 53, 69] // Amarelo ou vermelho
      }))
    ].sort((a, b) => a.minute - b.minute);

    if (events.length > 0) {
      let currentY = eventsFinalY + 10;
      
      events.forEach((event, index) => {
        // Linha do tempo visual
        doc.setFillColor(...event.color);
        doc.rect(20, currentY - 2, 3, 8, 'F'); // Barra vertical colorida
        
        // Marcador do evento
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(event.marker, 21, currentY + 2);
        
        // Minuto
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${event.minute}'`, 35, currentY);
        
        // Tipo do evento
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${event.type}: ${event.player}`, 50, currentY);
        
        // Time
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${event.team})`, 50, currentY + 4);
        
        currentY += 12; // Espaçamento entre eventos
        
        // Linha conectora se não for o último
        if (index < events.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.line(21.5, currentY - 4, 21.5, currentY - 8);
        }
      });
    } else {
      doc.setFontSize(11);
      doc.text('Nenhum evento registrado durante a partida', 20, eventsFinalY + 10);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `sumula_${data.homeTeamName}_vs_${data.awayTeamName}_${timestamp}.pdf`;
    
    doc.save(filename);
  }, []);

  return { exportPDF };
};
