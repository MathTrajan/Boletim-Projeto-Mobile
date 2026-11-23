import { describe, expect, test } from 'vitest';

import {
  diaDaSemana,
  diasAte,
  formatarData,
  formatarNota,
  iniciais,
  paraData,
  primeiroNome,
  rotuloPrazo,
} from './formato';

describe('paraData', () => {
  test('lê AAAA-MM-DD no fuso local, sem voltar um dia', () => {
    const data = paraData('2026-12-01');
    expect(data.getFullYear()).toBe(2026);
    expect(data.getMonth()).toBe(11);
    expect(data.getDate()).toBe(1);
  });
});

describe('formatarData', () => {
  test('usa o formato brasileiro', () => {
    expect(formatarData('2026-01-05')).toBe('05/01/2026');
  });
});

describe('diaDaSemana', () => {
  test('escreve com inicial maiúscula', () => {
    expect(diaDaSemana('2026-12-01')).toBe('Terça-feira');
  });
});

describe('diasAte', () => {
  test('conta a diferença em dias entre duas datas', () => {
    expect(diasAte('2026-12-05', '2026-12-01')).toBe(4);
    expect(diasAte('2026-11-28', '2026-12-01')).toBe(-3);
  });

  test('atravessa a virada de mês sem erro', () => {
    expect(diasAte('2026-12-01', '2026-11-30')).toBe(1);
  });
});

describe('rotuloPrazo', () => {
  test('usa palavras para os dias vizinhos', () => {
    expect(rotuloPrazo('2026-12-01', '2026-12-01')).toBe('Hoje');
    expect(rotuloPrazo('2026-12-02', '2026-12-01')).toBe('Amanhã');
    expect(rotuloPrazo('2026-11-30', '2026-12-01')).toBe('Ontem');
  });

  test('conta os dias quando o prazo está longe', () => {
    expect(rotuloPrazo('2026-12-10', '2026-12-01')).toBe('Em 9 dias');
    expect(rotuloPrazo('2026-11-20', '2026-12-01')).toBe('Há 11 dias');
  });
});

describe('formatarNota', () => {
  test('sempre mostra uma casa decimal', () => {
    expect(formatarNota(7)).toBe('7,0');
    expect(formatarNota(6.25)).toBe('6,3');
  });
});

describe('primeiroNome', () => {
  test('pega só a primeira palavra', () => {
    expect(primeiroNome('  Matheus Trajano ')).toBe('Matheus');
  });

  test('nome vazio continua vazio', () => {
    expect(primeiroNome('   ')).toBe('');
  });
});

describe('iniciais', () => {
  test('ignora as palavras curtas de ligação', () => {
    expect(iniciais('Banco de Dados')).toBe('BD');
  });

  test('usa no máximo duas letras', () => {
    expect(iniciais('Desenvolvimento para Dispositivos Móveis')).toBe('DD');
  });

  test('nome de uma palavra devolve uma letra', () => {
    expect(iniciais('Algoritmos')).toBe('A');
  });
});
