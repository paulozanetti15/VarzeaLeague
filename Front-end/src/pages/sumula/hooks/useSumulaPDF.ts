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
    
    // Cores do tema
    const primaryColor = [52, 152, 219]; // Azul
    const secondaryColor = [149, 165, 166]; // Cinza
    const successColor = [39, 174, 96]; // Verde mais escuro
    const warningColor = [243, 156, 18]; // Laranja/Amarelo mais escuro
    const dangerColor = [192, 57, 43]; // Vermelho mais escuro
    
    // Cabeçalho elegante
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('SÚMULA OFICIAL', 105, 15, { align: 'center' });
    
    // Informações da partida
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.text(`Tipo: ${matchType}`, 20, 40);
    doc.text(`Data: ${data.matchDate || 'Não informada'}`, 20, 47);
    doc.text(`Local: ${data.matchLocation || 'Não informado'}`, 20, 54);
    doc.text(`Quadra: ${data.matchLocation || 'Não informado'}`, 20, 61);
    
    // Placar destacado
    doc.setFillColor(240, 240, 240);
    doc.rect(60, 67, 90, 15, 'F');
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.rect(60, 67, 90, 15);
    
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    const scoreText = `${data.homeTeamName || 'Time Casa'} ${data.homeScore || 0} x ${data.awayScore || 0} ${data.awayTeamName || 'Time Visitante'}`;
    doc.text(scoreText, 105, 77, { align: 'center' });

    let currentY = 92;

    // Tabela de Gols
    if (data.goals.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(successColor[0], successColor[1], successColor[2]);
      doc.text('Gols Marcados', 20, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Jogador', 'Time', 'Minuto']],
        body: data.goals.map(goal => [
          goal.player || goal.playerName || '',
          goal.team || goal.teamName || 'Time não identificado',
          `${goal.minute || 0}'`
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [successColor[0], successColor[1], successColor[2]],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Nenhum gol registrado', 20, currentY);
      currentY += 10;
    }

    // Tabela de Cartões
    doc.setFontSize(14);
    doc.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
    doc.text('Cartões Aplicados', 20, currentY);

    if (data.cards.length > 0) {
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Jogador', 'Time', 'Tipo', 'Minuto']],
        body: data.cards.map(card => [
          card.player || card.playerName || '',
          card.team || card.teamName || 'Time não identificado',
          card.type === 'Amarelo' || card.type === 'yellow' ? 'Amarelo' : 'Vermelho',
          `${card.minute || 0}'`
        ]),
        theme: 'striped',
        headStyles: { 
          fillColor: [warningColor[0], warningColor[1], warningColor[2]],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: { fillColor: [248, 248, 248] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 10 }
      });
      
      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Nenhum cartão registrado', 20, currentY + 10);
      currentY += 20;
    }

  // Timeline de Eventos
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Linha do Tempo da Partida', 20, currentY);

    // Combinar e ordenar eventos por minuto
    const events = [
      ...data.goals.map(goal => ({
        type: 'Gol',
        player: goal.player || goal.playerName || '',
        team: goal.team || goal.teamName || 'Time não identificado',
        minute: goal.minute || 0,
        marker: 'GOL',
        color: successColor
      })),
      ...data.cards.map(card => ({
        type: 'Cartão',
        player: card.player || card.playerName || '',
        team: card.team || card.teamName || 'Time não identificado',
        minute: card.minute || 0,
        marker: (card.type === 'Amarelo' || card.type === 'yellow') ? 'AMR' : 'VRM',
        color: (card.type === 'Amarelo' || card.type === 'yellow') ? warningColor : dangerColor
      }))
    ].sort((a, b) => a.minute - b.minute);

    if (events.length > 0) {
      let timelineY = currentY + 15;

      // layout measurements
      const barX = 20;
      const barWidth = 10; // wider bar
      const barHeight = 16; // taller bar
      const barCenterX = barX + barWidth / 2;

      const pageHeight = doc.internal.pageSize.height;
      const footerHeight = 20;
      const bottomMargin = 10;

      events.forEach((event, index) => {
        const cardX = 15;
        const cardW = 175;
        const cardH = barHeight + 6;

        // If this event would overflow the page (including footer), add a new page
        const neededSpaceForEvent = cardH + 6 + footerHeight + bottomMargin;
        if (timelineY + neededSpaceForEvent > pageHeight) {
          doc.addPage();
          timelineY = 25; // reset top area for content on new page
        }

        // Fundo para o evento (card)
        doc.setFillColor(250, 250, 250);
        doc.rect(cardX, timelineY - 5, cardW, cardH, 'F');

        // Barra vertical colorida (centered)
        doc.setFillColor(event.color[0], event.color[1], event.color[2]);
        doc.rect(barX, timelineY - Math.floor(barHeight / 2), barWidth, barHeight, 'F');

        // Marcador do evento: centered inside the bar
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        const markerText = event.marker || '';
        const markerWidth = (doc.getTextWidth ? doc.getTextWidth(markerText) : markerText.length * 3.5) as number;
        const markerX = Math.round(barCenterX - markerWidth / 2);
        const markerY = timelineY + 2;
        doc.text(markerText, markerX, markerY);

        // Minuto (to the right of the bar)
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${event.minute}'`, barX + barWidth + 18, timelineY + 2);

        // Tipo do evento e jogador
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${event.type}: ${event.player}`, barX + barWidth + 48, timelineY + 1);

        // Time
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${event.team})`, barX + barWidth + 48, timelineY + 7);

        timelineY += cardH + 6; // spacing

        // Linha conectora se não for o último - center under the bar
        if (index < events.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(1);
          const connectorX = barCenterX;
          doc.line(connectorX, timelineY - cardH + 4, connectorX, timelineY - 6);
        }
      });

      // update currentY to the last used Y after the timeline
      currentY = timelineY + 10;
    } else {
      doc.setFontSize(11);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Nenhum evento registrado durante a partida', 20, currentY + 20);
    }

    // Rodapé: garantir que não sobreponha o conteúdo. Se não houver espaço suficiente, criar nova página.
    const pageHeight = doc.internal.pageSize.height;
    const footerHeight = 20;
    const bottomMargin = 6;

    if (currentY + footerHeight + bottomMargin > pageHeight) {
      doc.addPage();
    }

    // redesenhar em relação à página atual
    const currentPageHeight = doc.internal.pageSize.height;
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, currentPageHeight - footerHeight, 210, footerHeight, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('Documento gerado automaticamente pelo sistema VarzeaLeague', 105, currentPageHeight - 12, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 105, currentPageHeight - 6, { align: 'center' });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `sumula_${data.homeTeamName || 'casa'}_vs_${data.awayTeamName || 'visitante'}_${timestamp}.pdf`;
    
    doc.save(filename);
  }, []);

  return { exportPDF };
};
