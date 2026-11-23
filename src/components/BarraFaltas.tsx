import type { JSX } from 'react';

import type { Frequencia } from '../tipos';
import { formatarPercentual } from '../utils/formato';
import './BarraFaltas.css';

interface BarraFaltasProps {
  faltas: number;
  frequencia: Frequencia;
  limiteFaltas: number;
  compacta?: boolean;
}

export function BarraFaltas({
  faltas,
  frequencia,
  limiteFaltas,
  compacta = false,
}: BarraFaltasProps): JSX.Element {
  const consumido = frequencia.faltasMaximas > 0 ? Math.min(faltas / frequencia.faltasMaximas, 1) * 100 : 0;
  const nivel = frequencia.estourou ? 'estourado' : consumido >= 75 ? 'atencao' : 'tranquilo';

  return (
    <div className={`barra-faltas barra-faltas--${nivel}${compacta ? ' barra-faltas--compacta' : ''}`}>
      <div className="barra-faltas__cabecalho">
        <span>
          {faltas} de {frequencia.faltasMaximas} faltas
        </span>
        <span className="barra-faltas__limite">limite de {formatarPercentual(limiteFaltas)}</span>
      </div>
      <div
        className="barra-faltas__trilha"
        role="progressbar"
        aria-label="Faltas usadas"
        aria-valuenow={Math.round(consumido)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="barra-faltas__preenchimento" style={{ width: `${Math.max(consumido, 2)}%` }} />
      </div>
      {!compacta && (
        <span className="barra-faltas__aviso">
          {frequencia.estourou
            ? 'Limite de faltas ultrapassado.'
            : frequencia.faltasRestantes === 0
              ? 'Você não pode mais faltar nesta matéria.'
              : `Ainda dá para faltar ${frequencia.faltasRestantes} ${frequencia.faltasRestantes === 1 ? 'aula' : 'aulas'}.`}
        </span>
      )}
    </div>
  );
}

export default BarraFaltas;
