import { documentTextOutline, easelOutline, schoolOutline } from 'ionicons/icons';

import type { Situacao, TipoCompromisso } from '../tipos';

export const CORES_MATERIA = [
  '#1D4ED8',
  '#0891B2',
  '#059669',
  '#D97706',
  '#DC2626',
  '#7C3AED',
  '#DB2777',
  '#475569',
];

interface DescricaoTipo {
  nome: string;
  icone: string;
  cor: string;
}

const TIPOS: Record<TipoCompromisso, DescricaoTipo> = {
  prova: { nome: 'Prova', icone: schoolOutline, cor: '#DC2626' },
  trabalho: { nome: 'Trabalho', icone: documentTextOutline, cor: '#1D4ED8' },
  apresentacao: { nome: 'Apresentação', icone: easelOutline, cor: '#7C3AED' },
};

export const TIPOS_COMPROMISSO = Object.entries(TIPOS).map(([id, descricao]) => ({
  id: id as TipoCompromisso,
  ...descricao,
}));

export function descreverTipo(tipo: TipoCompromisso): DescricaoTipo {
  return TIPOS[tipo] ?? TIPOS.trabalho;
}

interface DescricaoSituacao {
  nome: string;
  cor: 'success' | 'primary' | 'warning' | 'danger';
}

const SITUACOES: Record<Situacao, DescricaoSituacao> = {
  aprovado: { nome: 'Aprovado', cor: 'success' },
  em_andamento: { nome: 'Em andamento', cor: 'primary' },
  risco: { nome: 'Atenção', cor: 'warning' },
  reprovado_nota: { nome: 'Reprovado por nota', cor: 'danger' },
  reprovado_falta: { nome: 'Reprovado por falta', cor: 'danger' },
};

export function descreverSituacao(situacao: Situacao): DescricaoSituacao {
  return SITUACOES[situacao] ?? SITUACOES.em_andamento;
}
