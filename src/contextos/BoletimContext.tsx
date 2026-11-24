import { useCallback, useEffect, useMemo, useState } from 'react';
import type { JSX, ReactNode } from 'react';

import { compromissosDeExemplo, materiasDeExemplo } from '../dados/exemplos';
import {
  CONFIGURACAO_PADRAO,
  apagarTudo,
  gravarCompromissos,
  gravarConfiguracao,
  gravarMaterias,
  lerCompromissos,
  lerConfiguracao,
  lerMaterias,
} from '../servicos/armazenamento';
import type { Avaliacao, Compromisso, Configuracao, DadosCompromisso, DadosMateria, Materia } from '../tipos';

import { BoletimContext } from './boletimContexto';
import type { ValorBoletim } from './boletimContexto';

function gerarId(prefixo: string): string {
  return `${prefixo}${Date.now().toString(36)}${Math.floor(Math.random() * 1_000_000).toString(36)}`;
}

export function BoletimProvider({ children }: { children: ReactNode }): JSX.Element {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [configuracao, setConfiguracao] = useState<Configuracao>(CONFIGURACAO_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [erroPersistencia, setErroPersistencia] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar(): Promise<void> {
      try {
        const [salvasMaterias, salvosCompromissos, salvaConfiguracao] = await Promise.all([
          lerMaterias(),
          lerCompromissos(),
          lerConfiguracao(),
        ]);
        if (!ativo) return;
        setMaterias(salvasMaterias);
        setCompromissos(salvosCompromissos);
        setConfiguracao(salvaConfiguracao);
      } catch (erro) {
        console.error('Falha ao carregar os dados salvos.', erro);
        if (ativo) setErroPersistencia('Não foi possível carregar os dados salvos.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (carregando) return;
    gravarMaterias(materias).catch((erro: unknown) => {
      console.error('Falha ao gravar as matérias.', erro);
      setErroPersistencia('Não foi possível salvar as matérias neste aparelho.');
    });
  }, [materias, carregando]);

  useEffect(() => {
    if (carregando) return;
    gravarCompromissos(compromissos).catch((erro: unknown) => {
      console.error('Falha ao gravar a agenda.', erro);
      setErroPersistencia('Não foi possível salvar a agenda neste aparelho.');
    });
  }, [compromissos, carregando]);

  useEffect(() => {
    if (carregando) return;
    gravarConfiguracao(configuracao).catch((erro: unknown) => {
      console.error('Falha ao gravar a configuração.', erro);
      setErroPersistencia('Não foi possível salvar os ajustes neste aparelho.');
    });
  }, [configuracao, carregando]);

  const adicionarMateria = useCallback((dados: DadosMateria) => {
    setMaterias((atuais) => [...atuais, { ...dados, id: gerarId('m'), faltas: 0, avaliacoes: [] }]);
  }, []);

  const atualizarMateria = useCallback((id: string, dados: DadosMateria) => {
    setMaterias((atuais) =>
      atuais.map((materia) => (materia.id === id ? { ...materia, ...dados } : materia)),
    );
  }, []);

  const removerMateria = useCallback((id: string) => {
    setMaterias((atuais) => atuais.filter((materia) => materia.id !== id));
    setCompromissos((atuais) => atuais.filter((item) => item.materiaId !== id));
  }, []);

  const registrarFalta = useCallback((id: string, variacao: number) => {
    setMaterias((atuais) =>
      atuais.map((materia) =>
        materia.id === id ? { ...materia, faltas: Math.max(0, materia.faltas + variacao) } : materia,
      ),
    );
  }, []);

  const salvarAvaliacao = useCallback(
    (materiaId: string, avaliacao: Omit<Avaliacao, 'id'> & { id?: string }) => {
      setMaterias((atuais) =>
        atuais.map((materia) => {
          if (materia.id !== materiaId) return materia;

          if (avaliacao.id) {
            const id = avaliacao.id;
            return {
              ...materia,
              avaliacoes: materia.avaliacoes.map((item) => (item.id === id ? { ...avaliacao, id } : item)),
            };
          }

          return {
            ...materia,
            avaliacoes: [...materia.avaliacoes, { ...avaliacao, id: gerarId('a') }],
          };
        }),
      );
    },
    [],
  );

  const removerAvaliacao = useCallback((materiaId: string, avaliacaoId: string) => {
    setMaterias((atuais) =>
      atuais.map((materia) =>
        materia.id === materiaId
          ? { ...materia, avaliacoes: materia.avaliacoes.filter((item) => item.id !== avaliacaoId) }
          : materia,
      ),
    );
  }, []);

  const adicionarCompromisso = useCallback((dados: DadosCompromisso) => {
    setCompromissos((atuais) => [...atuais, { ...dados, id: gerarId('c'), concluido: false }]);
  }, []);

  const alternarCompromisso = useCallback((id: string) => {
    setCompromissos((atuais) =>
      atuais.map((item) => (item.id === id ? { ...item, concluido: !item.concluido } : item)),
    );
  }, []);

  const removerCompromisso = useCallback((id: string) => {
    setCompromissos((atuais) => atuais.filter((item) => item.id !== id));
  }, []);

  const atualizarConfiguracao = useCallback((parcial: Partial<Configuracao>) => {
    setConfiguracao((atual) => ({ ...atual, ...parcial }));
  }, []);

  const carregarExemplos = useCallback(() => {
    setMaterias(materiasDeExemplo());
    setCompromissos(compromissosDeExemplo());
  }, []);

  const limparDados = useCallback(async () => {
    try {
      await apagarTudo();
      setMaterias([]);
      setCompromissos([]);
      setConfiguracao(CONFIGURACAO_PADRAO);
      setErroPersistencia(null);
    } catch (erro) {
      console.error('Falha ao apagar os dados.', erro);
      setErroPersistencia('Não foi possível apagar os dados.');
    }
  }, []);

  const buscarMateria = useCallback(
    (id: string) => materias.find((materia) => materia.id === id),
    [materias],
  );

  const valor = useMemo<ValorBoletim>(
    () => ({
      materias,
      compromissos,
      configuracao,
      carregando,
      erroPersistencia,
      adicionarMateria,
      atualizarMateria,
      removerMateria,
      buscarMateria,
      registrarFalta,
      salvarAvaliacao,
      removerAvaliacao,
      adicionarCompromisso,
      alternarCompromisso,
      removerCompromisso,
      atualizarConfiguracao,
      carregarExemplos,
      limparDados,
    }),
    [
      materias,
      compromissos,
      configuracao,
      carregando,
      erroPersistencia,
      adicionarMateria,
      atualizarMateria,
      removerMateria,
      buscarMateria,
      registrarFalta,
      salvarAvaliacao,
      removerAvaliacao,
      adicionarCompromisso,
      alternarCompromisso,
      removerCompromisso,
      atualizarConfiguracao,
      carregarExemplos,
      limparDados,
    ],
  );

  return <BoletimContext.Provider value={valor}>{children}</BoletimContext.Provider>;
}

export default BoletimProvider;
