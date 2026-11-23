export type PreferenciaTema = 'sistema' | 'claro' | 'escuro';

export type TipoCompromisso = 'prova' | 'trabalho' | 'apresentacao';

export type Situacao = 'aprovado' | 'em_andamento' | 'risco' | 'reprovado_nota' | 'reprovado_falta';

export interface Avaliacao {
  id: string;
  nome: string;
  peso: number;
  nota: number | null;
}

export interface Materia {
  id: string;
  nome: string;
  professor: string;
  cor: string;
  aulasPrevistas: number;
  faltas: number;
  avaliacoes: Avaliacao[];
}

export type DadosMateria = Omit<Materia, 'id' | 'faltas' | 'avaliacoes'>;

export interface Compromisso {
  id: string;
  materiaId: string;
  titulo: string;
  tipo: TipoCompromisso;
  data: string;
  concluido: boolean;
}

export type DadosCompromisso = Omit<Compromisso, 'id' | 'concluido'>;

export interface Configuracao {
  nome: string;
  mediaMinima: number;
  limiteFaltas: number;
  tema: PreferenciaTema;
}

export interface Desempenho {
  mediaParcial: number | null;
  pesoLancado: number;
  pesoPendente: number;
  notaNecessaria: number | null;
  situacao: Situacao;
}

export interface Frequencia {
  faltasMaximas: number;
  faltasRestantes: number;
  percentualUsado: number;
  estourou: boolean;
}
