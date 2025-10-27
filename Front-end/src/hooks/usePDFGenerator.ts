import { useState } from 'react';

// PDF Libraries
// @ts-ignore - tipos serão resolvidos via dependência
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const usePDFGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlayerStatsPDF = (playerStats: any[], teamName: string) => {
    if (!playerStats || playerStats.length === 0) return;

    setIsGenerating(true);

    try {
      const filename = `relatorio-jogadores-${teamName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
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

      // Divider line
      doc.setDrawColor(200);
      doc.line(margin, 78, 555, 78);

      // Table data
      const headers = [['Jogador', 'Posição', 'Sexo', 'Gols', 'Amarelos', 'Vermelhos', 'Cartões']];
      const body = playerStats.map((p: any) => [
        p.nome || '-', p.posicao || '-', p.sexo || '-',
        String(p.gols || 0), String(p.amarelos || 0),
        String(p.vermelhos || 0), String(p.cartoes || 0)
      ]);

      // Generate table
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
          6: { halign: 'center' },
        }
      });

      // Download with fallback
      try {
        doc.save(filename);
      } catch (err) {
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
          throw new Error('Erro ao baixar o PDF');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMatchReportPDF = (matchData: any, teamName: string) => {
    if (!matchData) return;

    setIsGenerating(true);

    try {
      const filename = `sumula-${teamName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(`Súmula da Partida - ${teamName}`, margin, 50);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const dateStr = new Date().toLocaleString();
      doc.text(`Gerado em: ${dateStr}`, margin, 70);

      // Divider line
      doc.setDrawColor(200);
      doc.line(margin, 78, 555, 78);

      // Match Information
      let yPosition = 100;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Informações da Partida', margin, yPosition);
      yPosition += 25;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      if (matchData.date) {
        doc.text(`Data: ${new Date(matchData.date).toLocaleDateString()}`, margin, yPosition);
        yPosition += 15;
      }

      if (matchData.time) {
        doc.text(`Horário: ${matchData.time}`, margin, yPosition);
        yPosition += 15;
      }

      if (matchData.location) {
        doc.text(`Local: ${matchData.location}`, margin, yPosition);
        yPosition += 15;
      }

      if (matchData.championship) {
        doc.text(`Campeonato: ${matchData.championship}`, margin, yPosition);
        yPosition += 15;
      }

      yPosition += 20;

      // Teams and Score
      if (matchData.homeTeam && matchData.awayTeam) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`${matchData.homeTeam} vs ${matchData.awayTeam}`, margin, yPosition);
        yPosition += 20;

        if (matchData.score) {
          doc.text(`Placar: ${matchData.score}`, margin, yPosition);
          yPosition += 20;
        }
      }

      // Players Section
      if (matchData.players && matchData.players.length > 0) {
        yPosition += 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Jogadores', margin, yPosition);
        yPosition += 25;

        const playerHeaders = [['Nome', 'Posição', 'Número']];
        const playerBody = matchData.players.map((p: any) => [
          p.nome || '-', p.posicao || '-', String(p.numero || '-')
        ]);

        autoTable(doc, {
          head: playerHeaders,
          body: playerBody,
          startY: yPosition,
          theme: 'striped',
          styles: { fontSize: 10, cellPadding: 6 },
          headStyles: { fillColor: [25, 118, 210], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 200 },
            1: { cellWidth: 100 },
            2: { cellWidth: 80, halign: 'center' }
          }
        });
      }

      // Events Section
      if (matchData.events && matchData.events.length > 0) {
        const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50;
        yPosition = finalY + 30;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Eventos da Partida', margin, yPosition);
        yPosition += 25;

        const eventHeaders = [['Tempo', 'Tipo', 'Jogador', 'Descrição']];
        const eventBody = matchData.events.map((e: any) => [
          e.time || '-', e.type || '-', e.player || '-', e.description || '-'
        ]);

        autoTable(doc, {
          head: eventHeaders,
          body: eventBody,
          startY: yPosition,
          theme: 'striped',
          styles: { fontSize: 9, cellPadding: 4 },
          headStyles: { fillColor: [25, 118, 210], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 60, halign: 'center' },
            1: { cellWidth: 80 },
            2: { cellWidth: 150 },
            3: { cellWidth: 200 }
          }
        });
      }

      // Download with fallback
      try {
        doc.save(filename);
      } catch (err) {
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
          console.error('Falha ao iniciar download do PDF da súmula:', e);
          throw new Error('Erro ao baixar o PDF da súmula');
        }
      }
    } catch (error) {
      console.error('Erro ao gerar PDF da súmula:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatePlayerStatsPDF,
    generateMatchReportPDF
  };
};