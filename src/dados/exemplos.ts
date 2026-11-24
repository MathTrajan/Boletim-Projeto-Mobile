import type { Compromisso, Materia } from '../tipos';
import { hojeISO, paraData } from '../utils/formato';

function emDias(quantidade: number): string {
  const data = paraData(hojeISO());
  data.setDate(data.getDate() + quantidade);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function materiasDeExemplo(): Materia[] {
  return [
    {
      id: 'exemplo-ddm',
      nome: 'Desenvolvimento para Dispositivos Móveis',
      professor: 'Gabriel de Oliveira Silva',
      cor: '#1D4ED8',
      aulasPrevistas: 80,
      faltas: 6,
      avaliacoes: [
        { id: 'exemplo-ddm-1', nome: 'Avaliação A1', peso: 5, nota: 8.5 },
        { id: 'exemplo-ddm-2', nome: 'Projeto A2', peso: 5, nota: null },
      ],
    },
    {
      id: 'exemplo-arq',
      nome: 'Arquitetura e Design de Software',
      professor: 'Corpo docente',
      cor: '#7C3AED',
      aulasPrevistas: 80,
      faltas: 2,
      avaliacoes: [
        { id: 'exemplo-arq-1', nome: 'Avaliação A1', peso: 5, nota: 9 },
        { id: 'exemplo-arq-2', nome: 'Avaliação A2', peso: 5, nota: 7 },
      ],
    },
    {
      id: 'exemplo-seg',
      nome: 'Segurança da Informação',
      professor: 'Corpo docente',
      cor: '#DC2626',
      aulasPrevistas: 80,
      faltas: 18,
      avaliacoes: [
        { id: 'exemplo-seg-1', nome: 'Avaliação A1', peso: 5, nota: 4 },
        { id: 'exemplo-seg-2', nome: 'Avaliação A2', peso: 5, nota: null },
      ],
    },
    {
      id: 'exemplo-ads',
      nome: 'Projeto ADS',
      professor: 'Corpo docente',
      cor: '#059669',
      aulasPrevistas: 60,
      faltas: 0,
      avaliacoes: [
        { id: 'exemplo-ads-1', nome: 'Documentação', peso: 7, nota: 9 },
        { id: 'exemplo-ads-2', nome: 'Apresentação final', peso: 3, nota: null },
      ],
    },
    {
      id: 'exemplo-web',
      nome: 'Desenvolvimento de Interfaces Web',
      professor: 'Corpo docente',
      cor: '#D97706',
      aulasPrevistas: 80,
      faltas: 22,
      avaliacoes: [{ id: 'exemplo-web-1', nome: 'Avaliação A1', peso: 5, nota: 9 }],
    },
  ];
}

export function compromissosDeExemplo(): Compromisso[] {
  return [
    {
      id: 'exemplo-c1',
      materiaId: 'exemplo-seg',
      titulo: 'Prova da unidade 3',
      tipo: 'prova',
      data: emDias(3),
      concluido: false,
    },
    {
      id: 'exemplo-c2',
      materiaId: 'exemplo-ddm',
      titulo: 'Entrega do Projeto A2',
      tipo: 'trabalho',
      data: emDias(7),
      concluido: false,
    },
    {
      id: 'exemplo-c3',
      materiaId: 'exemplo-arq',
      titulo: 'Diagrama de componentes',
      tipo: 'trabalho',
      data: emDias(-2),
      concluido: false,
    },
    {
      id: 'exemplo-c4',
      materiaId: 'exemplo-ads',
      titulo: 'Apresentação do artigo',
      tipo: 'apresentacao',
      data: emDias(14),
      concluido: false,
    },
    {
      id: 'exemplo-c5',
      materiaId: 'exemplo-web',
      titulo: 'Lista de exercícios de CSS',
      tipo: 'trabalho',
      data: emDias(-5),
      concluido: true,
    },
  ];
}
