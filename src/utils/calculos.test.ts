import { describe, expect, test } from 'vitest';

import type { Avaliacao, Compromisso, Configuracao, Materia } from '../tipos';

import {
  calcularDesempenho,
  calcularFrequencia,
  compromissosDaMateria,
  contarPorSituacao,
  filtrarPorTexto,
  mediaGeral,
  ordenarCompromissos,
  ordenarMaterias,
} from './calculos';

const CONFIG: Configuracao = { nome: '', mediaMinima: 6, limiteFaltas: 25, tema: 'sistema' };

function avaliacao(nome: string, peso: number, nota: number | null): Avaliacao {
  return { id: `a-${nome}`, nome, peso, nota };
}

function materia(parcial: Partial<Materia> = {}): Materia {
  return {
    id: 'm1',
    nome: 'Algoritmos',
    professor: 'Fulano',
    cor: '#1D4ED8',
    aulasPrevistas: 80,
    faltas: 0,
    avaliacoes: [],
    ...parcial,
  };
}

describe('calcularFrequencia', () => {
  test('o limite é a parte inteira do percentual sobre as aulas', () => {
    const frequencia = calcularFrequencia(materia({ aulasPrevistas: 80, faltas: 10 }), 25);
    expect(frequencia.faltasMaximas).toBe(20);
    expect(frequencia.faltasRestantes).toBe(10);
    expect(frequencia.estourou).toBe(false);
  });

  test('faltar exatamente o limite ainda não reprova', () => {
    expect(calcularFrequencia(materia({ faltas: 20 }), 25).estourou).toBe(false);
  });

  test('uma falta acima do limite reprova', () => {
    const frequencia = calcularFrequencia(materia({ faltas: 21 }), 25);
    expect(frequencia.estourou).toBe(true);
    expect(frequencia.faltasRestantes).toBe(0);
  });

  test('carga horária zerada não gera divisão inválida', () => {
    expect(calcularFrequencia(materia({ aulasPrevistas: 0 }), 25).percentualUsado).toBe(0);
  });
});

describe('calcularDesempenho', () => {
  test('a média parcial é ponderada apenas pelas notas já lançadas', () => {
    const alvo = materia({
      avaliacoes: [avaliacao('P1', 2, 8), avaliacao('T1', 1, 5), avaliacao('P2', 2, null)],
    });
    const desempenho = calcularDesempenho(alvo, CONFIG);

    expect(desempenho.mediaParcial).toBeCloseTo(7, 5);
    expect(desempenho.pesoLancado).toBe(3);
    expect(desempenho.pesoPendente).toBe(2);
  });

  test('a nota necessária considera o peso total, não só o que falta', () => {
    const alvo = materia({ avaliacoes: [avaliacao('P1', 1, 4), avaliacao('P2', 1, null)] });
    expect(calcularDesempenho(alvo, CONFIG).notaNecessaria).toBeCloseTo(8, 5);
  });

  test('quem já garantiu a média aparece como aprovado antes do fim', () => {
    const alvo = materia({ avaliacoes: [avaliacao('P1', 3, 10), avaliacao('P2', 1, null)] });
    const desempenho = calcularDesempenho(alvo, CONFIG);

    expect(desempenho.notaNecessaria).toBeLessThanOrEqual(0);
    expect(desempenho.situacao).toBe('aprovado');
  });

  test('nota necessária acima de 10 significa reprovado por nota', () => {
    const alvo = materia({ avaliacoes: [avaliacao('P1', 3, 1), avaliacao('P2', 1, null)] });
    expect(calcularDesempenho(alvo, CONFIG).situacao).toBe('reprovado_nota');
  });

  test('precisar de 7 ou mais no que falta liga o alerta', () => {
    const alvo = materia({ avaliacoes: [avaliacao('P1', 1, 5), avaliacao('P2', 1, null)] });
    expect(calcularDesempenho(alvo, CONFIG).situacao).toBe('risco');
  });

  test('falta acima do limite reprova mesmo com nota boa', () => {
    const alvo = materia({ faltas: 30, avaliacoes: [avaliacao('P1', 1, 10)] });
    expect(calcularDesempenho(alvo, CONFIG).situacao).toBe('reprovado_falta');
  });

  test('matéria sem avaliação cadastrada fica em andamento', () => {
    const desempenho = calcularDesempenho(materia(), CONFIG);
    expect(desempenho.mediaParcial).toBeNull();
    expect(desempenho.notaNecessaria).toBeNull();
    expect(desempenho.situacao).toBe('em_andamento');
  });

  test('com tudo lançado o veredito sai pela média', () => {
    const aprovado = materia({ avaliacoes: [avaliacao('P1', 1, 6)] });
    const reprovado = materia({ avaliacoes: [avaliacao('P1', 1, 5.9)] });

    expect(calcularDesempenho(aprovado, CONFIG).situacao).toBe('aprovado');
    expect(calcularDesempenho(reprovado, CONFIG).situacao).toBe('reprovado_nota');
  });
});

describe('mediaGeral', () => {
  test('ignora matéria sem nenhuma nota lançada', () => {
    const lista = [
      materia({ id: 'a', avaliacoes: [avaliacao('P1', 1, 8)] }),
      materia({ id: 'b', avaliacoes: [avaliacao('P1', 1, 6)] }),
      materia({ id: 'c' }),
    ];
    expect(mediaGeral(lista, CONFIG)).toBeCloseTo(7, 5);
  });

  test('sem nenhuma nota no semestre devolve null', () => {
    expect(mediaGeral([materia()], CONFIG)).toBeNull();
    expect(mediaGeral([], CONFIG)).toBeNull();
  });
});

describe('contarPorSituacao', () => {
  test('agrupa as matérias por veredito', () => {
    const contagem = contarPorSituacao(
      [
        materia({ id: 'a', avaliacoes: [avaliacao('P1', 1, 9)] }),
        materia({ id: 'b', faltas: 40, avaliacoes: [avaliacao('P1', 1, 9)] }),
        materia({ id: 'c' }),
      ],
      CONFIG,
    );

    expect(contagem.aprovado).toBe(1);
    expect(contagem.reprovado_falta).toBe(1);
    expect(contagem.em_andamento).toBe(1);
  });
});

describe('ordenarMaterias', () => {
  test('ordena por nome respeitando acento', () => {
    const nomes = ordenarMaterias([
      materia({ id: '1', nome: 'Ética' }),
      materia({ id: '2', nome: 'Algoritmos' }),
      materia({ id: '3', nome: 'Estatística' }),
    ]).map((item) => item.nome);

    expect(nomes).toEqual(['Algoritmos', 'Estatística', 'Ética']);
  });
});

describe('ordenarCompromissos', () => {
  const lista: Compromisso[] = [
    { id: '1', materiaId: 'm1', titulo: 'Entrega', tipo: 'trabalho', data: '2026-12-10', concluido: false },
    { id: '2', materiaId: 'm1', titulo: 'Prova', tipo: 'prova', data: '2026-12-01', concluido: false },
    { id: '3', materiaId: 'm2', titulo: 'Feito', tipo: 'prova', data: '2026-11-01', concluido: true },
  ];

  test('pendentes primeiro, depois por data', () => {
    expect(ordenarCompromissos(lista).map((item) => item.id)).toEqual(['2', '1', '3']);
  });

  test('filtra pela matéria mantendo a ordem', () => {
    expect(compromissosDaMateria(lista, 'm1').map((item) => item.id)).toEqual(['2', '1']);
  });
});

describe('filtrarPorTexto', () => {
  const lista = [materia({ id: '1', nome: 'Estatística' }), materia({ id: '2', nome: 'Banco de Dados' })];

  test('ignora acento e caixa', () => {
    expect(filtrarPorTexto(lista, 'ESTATISTICA').map((item) => item.id)).toEqual(['1']);
  });

  test('termo em branco não filtra nada', () => {
    expect(filtrarPorTexto(lista, '  ')).toHaveLength(2);
  });
});
