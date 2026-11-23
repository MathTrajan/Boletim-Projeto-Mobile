const FORMATADOR_DATA_LONGA = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
});

const FORMATADOR_DIA_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });

export function paraData(iso: string): Date {
  const [ano, mes, dia] = iso.split('-').map(Number);
  return new Date(ano, (mes ?? 1) - 1, dia ?? 1);
}

export function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function formatarData(iso: string): string {
  return paraData(iso).toLocaleDateString('pt-BR');
}

export function formatarDataLonga(iso: string): string {
  return FORMATADOR_DATA_LONGA.format(paraData(iso));
}

export function diaDaSemana(iso: string): string {
  const texto = FORMATADOR_DIA_SEMANA.format(paraData(iso));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function diasAte(iso: string, referencia: string = hojeISO()): number {
  const umDia = 24 * 60 * 60 * 1000;
  return Math.round((paraData(iso).getTime() - paraData(referencia).getTime()) / umDia);
}

export function rotuloPrazo(iso: string, referencia: string = hojeISO()): string {
  const dias = diasAte(iso, referencia);
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  if (dias === -1) return 'Ontem';
  if (dias > 1) return `Em ${dias} dias`;
  return `Há ${Math.abs(dias)} dias`;
}

export function formatarNota(nota: number): string {
  return nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatarPeso(peso: number): string {
  return peso.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

export function formatarPercentual(valor: number): string {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`;
}

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? '';
}

const LIGACOES = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'com', 'para', 'a', 'o', 'as', 'os'];

export function iniciais(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  const significativas = palavras.filter((palavra) => !LIGACOES.includes(palavra.toLowerCase()));
  const base = significativas.length > 0 ? significativas : palavras;

  return base
    .slice(0, 2)
    .map((palavra) => palavra.charAt(0).toUpperCase())
    .join('');
}
