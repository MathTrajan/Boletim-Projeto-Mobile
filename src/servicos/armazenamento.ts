import { Preferences } from '@capacitor/preferences';

import type { Avaliacao, Compromisso, Configuracao, Materia, PreferenciaTema } from '../tipos';

const CHAVE_MATERIAS = 'boletim.materias';
const CHAVE_COMPROMISSOS = 'boletim.compromissos';
const CHAVE_CONFIGURACAO = 'boletim.configuracao';

export const CONFIGURACAO_PADRAO: Configuracao = {
  nome: '',
  mediaMinima: 6,
  limiteFaltas: 25,
  tema: 'sistema',
};

const TEMAS_VALIDOS: PreferenciaTema[] = ['sistema', 'claro', 'escuro'];
const TIPOS_VALIDOS = ['prova', 'trabalho', 'apresentacao'];

function numeroOuPadrao(valor: unknown, padrao: number, minimo: number, maximo: number): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < minimo || numero > maximo) return padrao;
  return numero;
}

function saneiaAvaliacoes(bruto: unknown): Avaliacao[] {
  if (!Array.isArray(bruto)) return [];

  return bruto.reduce<Avaliacao[]>((validas, item) => {
    if (typeof item !== 'object' || item === null) return validas;

    const candidata = item as Partial<Avaliacao>;
    if (typeof candidata.id !== 'string' || typeof candidata.nome !== 'string') return validas;

    const nota = Number(candidata.nota);
    validas.push({
      id: candidata.id,
      nome: candidata.nome,
      peso: numeroOuPadrao(candidata.peso, 1, 0.1, 100),
      nota: candidata.nota === null || !Number.isFinite(nota) ? null : Math.min(Math.max(nota, 0), 10),
    });
    return validas;
  }, []);
}

function saneiaMaterias(bruto: unknown): Materia[] {
  if (!Array.isArray(bruto)) return [];

  return bruto.reduce<Materia[]>((validas, item) => {
    if (typeof item !== 'object' || item === null) return validas;

    const candidata = item as Partial<Materia>;
    if (typeof candidata.id !== 'string' || typeof candidata.nome !== 'string') return validas;

    validas.push({
      id: candidata.id,
      nome: candidata.nome,
      professor: typeof candidata.professor === 'string' ? candidata.professor : '',
      cor: typeof candidata.cor === 'string' ? candidata.cor : '#1D4ED8',
      aulasPrevistas: numeroOuPadrao(candidata.aulasPrevistas, 80, 1, 1000),
      faltas: numeroOuPadrao(candidata.faltas, 0, 0, 1000),
      avaliacoes: saneiaAvaliacoes(candidata.avaliacoes),
    });
    return validas;
  }, []);
}

function saneiaCompromissos(bruto: unknown): Compromisso[] {
  if (!Array.isArray(bruto)) return [];

  return bruto.reduce<Compromisso[]>((validos, item) => {
    if (typeof item !== 'object' || item === null) return validos;

    const candidato = item as Partial<Compromisso>;
    const completo =
      typeof candidato.id === 'string' &&
      typeof candidato.materiaId === 'string' &&
      typeof candidato.titulo === 'string' &&
      typeof candidato.data === 'string' &&
      typeof candidato.tipo === 'string' &&
      TIPOS_VALIDOS.includes(candidato.tipo);

    if (completo) {
      validos.push({
        id: candidato.id as string,
        materiaId: candidato.materiaId as string,
        titulo: candidato.titulo as string,
        tipo: candidato.tipo as Compromisso['tipo'],
        data: candidato.data as string,
        concluido: candidato.concluido === true,
      });
    }
    return validos;
  }, []);
}

function saneiaConfiguracao(bruto: unknown): Configuracao {
  if (typeof bruto !== 'object' || bruto === null) return CONFIGURACAO_PADRAO;

  const candidata = bruto as Partial<Configuracao>;
  return {
    nome: typeof candidata.nome === 'string' ? candidata.nome : CONFIGURACAO_PADRAO.nome,
    mediaMinima: numeroOuPadrao(candidata.mediaMinima, CONFIGURACAO_PADRAO.mediaMinima, 0, 10),
    limiteFaltas: numeroOuPadrao(candidata.limiteFaltas, CONFIGURACAO_PADRAO.limiteFaltas, 1, 100),
    tema:
      candidata.tema && TEMAS_VALIDOS.includes(candidata.tema) ? candidata.tema : CONFIGURACAO_PADRAO.tema,
  };
}

async function lerJson(chave: string): Promise<unknown> {
  const { value } = await Preferences.get({ key: chave });
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch (erro) {
    console.error(`Conteúdo inválido na chave "${chave}". Usando o padrão.`, erro);
    return null;
  }
}

export async function lerMaterias(): Promise<Materia[]> {
  return saneiaMaterias(await lerJson(CHAVE_MATERIAS));
}

export async function lerCompromissos(): Promise<Compromisso[]> {
  return saneiaCompromissos(await lerJson(CHAVE_COMPROMISSOS));
}

export async function lerConfiguracao(): Promise<Configuracao> {
  return saneiaConfiguracao(await lerJson(CHAVE_CONFIGURACAO));
}

export async function gravarMaterias(materias: Materia[]): Promise<void> {
  await Preferences.set({ key: CHAVE_MATERIAS, value: JSON.stringify(materias) });
}

export async function gravarCompromissos(compromissos: Compromisso[]): Promise<void> {
  await Preferences.set({ key: CHAVE_COMPROMISSOS, value: JSON.stringify(compromissos) });
}

export async function gravarConfiguracao(configuracao: Configuracao): Promise<void> {
  await Preferences.set({ key: CHAVE_CONFIGURACAO, value: JSON.stringify(configuracao) });
}

export async function apagarTudo(): Promise<void> {
  await Preferences.remove({ key: CHAVE_MATERIAS });
  await Preferences.remove({ key: CHAVE_COMPROMISSOS });
  await Preferences.remove({ key: CHAVE_CONFIGURACAO });
}
