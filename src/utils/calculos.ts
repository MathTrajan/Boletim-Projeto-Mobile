import type {
  Avaliacao,
  Compromisso,
  Configuracao,
  Desempenho,
  Frequencia,
  Materia,
  Situacao,
} from '../tipos';
import { diasAte } from './formato';

const NOTA_DE_ATENCAO = 7;

export function calcularFrequencia(materia: Materia, limiteFaltas: number): Frequencia {
  const faltasMaximas = Math.floor((materia.aulasPrevistas * limiteFaltas) / 100);
  const percentualUsado = materia.aulasPrevistas > 0 ? (materia.faltas / materia.aulasPrevistas) * 100 : 0;

  return {
    faltasMaximas,
    faltasRestantes: Math.max(0, faltasMaximas - materia.faltas),
    percentualUsado,
    estourou: materia.faltas > faltasMaximas,
  };
}

function somaPesos(avaliacoes: Avaliacao[]): number {
  return avaliacoes.reduce((total, avaliacao) => total + avaliacao.peso, 0);
}

export function calcularDesempenho(materia: Materia, configuracao: Configuracao): Desempenho {
  const lancadas = materia.avaliacoes.filter((avaliacao) => avaliacao.nota !== null);
  const pendentes = materia.avaliacoes.filter((avaliacao) => avaliacao.nota === null);

  const pesoLancado = somaPesos(lancadas);
  const pesoPendente = somaPesos(pendentes);
  const pesoTotal = pesoLancado + pesoPendente;

  const somaPontos = lancadas.reduce((total, avaliacao) => total + avaliacao.peso * (avaliacao.nota ?? 0), 0);
  const mediaParcial = pesoLancado > 0 ? somaPontos / pesoLancado : null;

  const notaNecessaria =
    pesoPendente > 0 ? (configuracao.mediaMinima * pesoTotal - somaPontos) / pesoPendente : null;

  return {
    mediaParcial,
    pesoLancado,
    pesoPendente,
    notaNecessaria,
    situacao: definirSituacao({
      materia,
      configuracao,
      mediaParcial,
      pesoTotal,
      pesoPendente,
      notaNecessaria,
    }),
  };
}

interface EntradaSituacao {
  materia: Materia;
  configuracao: Configuracao;
  mediaParcial: number | null;
  pesoTotal: number;
  pesoPendente: number;
  notaNecessaria: number | null;
}

function definirSituacao(entrada: EntradaSituacao): Situacao {
  const { materia, configuracao, mediaParcial, pesoTotal, pesoPendente, notaNecessaria } = entrada;

  if (calcularFrequencia(materia, configuracao.limiteFaltas).estourou) {
    return 'reprovado_falta';
  }

  if (pesoTotal === 0) return 'em_andamento';

  if (pesoPendente === 0 || notaNecessaria === null) {
    return (mediaParcial ?? 0) >= configuracao.mediaMinima ? 'aprovado' : 'reprovado_nota';
  }

  if (notaNecessaria <= 0) return 'aprovado';
  if (notaNecessaria > 10) return 'reprovado_nota';
  if (notaNecessaria >= NOTA_DE_ATENCAO) return 'risco';
  return 'em_andamento';
}

export function mediaGeral(materias: Materia[], configuracao: Configuracao): number | null {
  const medias = materias
    .map((materia) => calcularDesempenho(materia, configuracao).mediaParcial)
    .filter((media): media is number => media !== null);

  if (medias.length === 0) return null;
  return medias.reduce((total, media) => total + media, 0) / medias.length;
}

export function contarPorSituacao(materias: Materia[], configuracao: Configuracao): Record<Situacao, number> {
  const contagem: Record<Situacao, number> = {
    aprovado: 0,
    em_andamento: 0,
    risco: 0,
    reprovado_nota: 0,
    reprovado_falta: 0,
  };

  for (const materia of materias) {
    contagem[calcularDesempenho(materia, configuracao).situacao] += 1;
  }

  return contagem;
}

export function ordenarMaterias(materias: Materia[]): Materia[] {
  return [...materias].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function ordenarCompromissos(compromissos: Compromisso[]): Compromisso[] {
  return [...compromissos].sort((a, b) => {
    if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
    if (a.data !== b.data) return a.data < b.data ? -1 : 1;
    return a.titulo.localeCompare(b.titulo, 'pt-BR');
  });
}

export function compromissosDaMateria(compromissos: Compromisso[], materiaId: string): Compromisso[] {
  return ordenarCompromissos(compromissos.filter((item) => item.materiaId === materiaId));
}

export function proximosCompromissos(compromissos: Compromisso[], quantidade: number): Compromisso[] {
  return ordenarCompromissos(compromissos.filter((item) => !item.concluido)).slice(0, quantidade);
}

export function compromissosAtrasados(compromissos: Compromisso[]): Compromisso[] {
  return compromissos.filter((item) => !item.concluido && diasAte(item.data) < 0);
}

export function filtrarPorTexto<T extends { nome: string }>(itens: T[], termo: string): T[] {
  const alvo = normalizar(termo);
  if (!alvo) return itens;
  return itens.filter((item) => normalizar(item.nome).includes(alvo));
}

export function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
