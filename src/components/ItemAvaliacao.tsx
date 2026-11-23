import {
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonNote,
} from '@ionic/react';
import type { JSX } from 'react';
import { createOutline, trashOutline } from 'ionicons/icons';
import { useRef } from 'react';

import type { Avaliacao } from '../tipos';
import { formatarNota, formatarPeso } from '../utils/formato';
import './ItemAvaliacao.css';

interface ItemAvaliacaoProps {
  avaliacao: Avaliacao;
  mediaMinima: number;
  onEditar: (avaliacao: Avaliacao) => void;
  onRemover: (avaliacao: Avaliacao) => void;
}

export function ItemAvaliacao({
  avaliacao,
  mediaMinima,
  onEditar,
  onRemover,
}: ItemAvaliacaoProps): JSX.Element {
  const deslizante = useRef<HTMLIonItemSlidingElement>(null);
  const lancada = avaliacao.nota !== null;
  const atingiu = lancada && (avaliacao.nota ?? 0) >= mediaMinima;

  async function executar(acao: () => void): Promise<void> {
    await deslizante.current?.close();
    acao();
  }

  return (
    <IonItemSliding ref={deslizante} className="item-avaliacao">
      <IonItem button detail={false} onClick={() => executar(() => onEditar(avaliacao))}>
        <IonLabel>
          <h3 className="item-avaliacao__nome">{avaliacao.nome}</h3>
          <p>Peso {formatarPeso(avaliacao.peso)}</p>
        </IonLabel>
        <IonNote
          slot="end"
          className={`item-avaliacao__nota item-avaliacao__nota--${!lancada ? 'pendente' : atingiu ? 'boa' : 'baixa'}`}
        >
          {lancada ? formatarNota(avaliacao.nota ?? 0) : '--'}
        </IonNote>
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption color="medium" onClick={() => executar(() => onEditar(avaliacao))}>
          <IonIcon slot="icon-only" icon={createOutline} aria-label="Editar avaliação" />
        </IonItemOption>
        <IonItemOption color="danger" onClick={() => executar(() => onRemover(avaliacao))}>
          <IonIcon slot="icon-only" icon={trashOutline} aria-label="Excluir avaliação" />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
}

export default ItemAvaliacao;
