import { IonIcon } from '@ionic/react';
import type { JSX } from 'react';
import { chevronForward } from 'ionicons/icons';

import type { Desempenho, Frequencia, Materia } from '../tipos';
import { formatarNota, iniciais } from '../utils/formato';

import BarraFaltas from './BarraFaltas';
import EtiquetaSituacao from './EtiquetaSituacao';
import './CartaoMateria.css';

interface CartaoMateriaProps {
  materia: Materia;
  desempenho: Desempenho;
  frequencia: Frequencia;
  limiteFaltas: number;
  onAbrir: (materia: Materia) => void;
}

export function CartaoMateria({
  materia,
  desempenho,
  frequencia,
  limiteFaltas,
  onAbrir,
}: CartaoMateriaProps): JSX.Element {
  const pendentes = materia.avaliacoes.filter((avaliacao) => avaliacao.nota === null).length;

  return (
    <button
      type="button"
      className="cartao-materia"
      style={{ '--materia-cor': materia.cor } as React.CSSProperties}
      onClick={() => onAbrir(materia)}
    >
      <div className="cartao-materia__topo">
        <span className="cartao-materia__sigla">{iniciais(materia.nome)}</span>
        <div className="cartao-materia__identificacao">
          <h3 className="cartao-materia__nome">{materia.nome}</h3>
          <p className="cartao-materia__professor">{materia.professor || 'Professor não informado'}</p>
        </div>
        <IonIcon className="cartao-materia__seta" icon={chevronForward} aria-hidden="true" />
      </div>

      <div className="cartao-materia__numeros">
        <div className="cartao-materia__media">
          <span className="cartao-materia__rotulo">Média</span>
          <strong>{desempenho.mediaParcial === null ? '--' : formatarNota(desempenho.mediaParcial)}</strong>
        </div>
        <div className="cartao-materia__estado">
          <EtiquetaSituacao situacao={desempenho.situacao} />
          <span className="cartao-materia__pendentes">
            {pendentes === 0
              ? 'Todas as notas lançadas'
              : `${pendentes} ${pendentes === 1 ? 'avaliação pendente' : 'avaliações pendentes'}`}
          </span>
        </div>
      </div>

      <BarraFaltas faltas={materia.faltas} frequencia={frequencia} limiteFaltas={limiteFaltas} compacta />
    </button>
  );
}

export default CartaoMateria;
