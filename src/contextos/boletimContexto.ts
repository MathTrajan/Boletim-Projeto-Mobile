import { createContext } from 'react';

import type { Avaliacao, Compromisso, Configuracao, DadosCompromisso, DadosMateria, Materia } from '../tipos';

export interface ValorBoletim {
  materias: Materia[];
  compromissos: Compromisso[];
  configuracao: Configuracao;
  carregando: boolean;
  erroPersistencia: string | null;
  adicionarMateria: (dados: DadosMateria) => void;
  atualizarMateria: (id: string, dados: DadosMateria) => void;
  removerMateria: (id: string) => void;
  buscarMateria: (id: string) => Materia | undefined;
  registrarFalta: (id: string, variacao: number) => void;
  salvarAvaliacao: (materiaId: string, avaliacao: Omit<Avaliacao, 'id'> & { id?: string }) => void;
  removerAvaliacao: (materiaId: string, avaliacaoId: string) => void;
  adicionarCompromisso: (dados: DadosCompromisso) => void;
  alternarCompromisso: (id: string) => void;
  removerCompromisso: (id: string) => void;
  atualizarConfiguracao: (parcial: Partial<Configuracao>) => void;
  carregarExemplos: () => void;
  limparDados: () => Promise<void>;
}

export const BoletimContext = createContext<ValorBoletim | null>(null);
