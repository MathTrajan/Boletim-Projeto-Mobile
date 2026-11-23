import {
  IonCheckbox,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonNote,
} from '@ionic/react';
import type { JSX } from 'react';
import { trashOutline } from 'ionicons/icons';
import { useRef } from 'react';

import { descreverTipo } from '../dados/catalogo';
import type { Compromisso, Materia } from '../tipos';
import { diasAte, formatarData, rotuloPrazo } from '../utils/formato';
import './ItemCompromisso.css';

interface ItemCompromissoProps {
  compromisso: Compromisso;
  materia: Materia | undefined;
  onAlternar: (compromisso: Compromisso) => void;
  onRemover: (compromisso: Compromisso) => void;
}

export function ItemCompromisso({
  compromisso,
  materia,
  onAlternar,
  onRemover,
}: ItemCompromissoProps): JSX.Element {
  const deslizante = useRef<HTMLIonItemSlidingElement>(null);
  const tipo = descreverTipo(compromisso.tipo);
  const dias = diasAte(compromisso.data);
  const urgencia = compromisso.concluido ? 'feito' : dias < 0 ? 'atrasado' : dias <= 2 ? 'proximo' : 'normal';

  async function remover(): Promise<void> {
    await deslizante.current?.close();
    onRemover(compromisso);
  }

  return (
    <IonItemSliding ref={deslizante} className={`item-compromisso item-compromisso--${urgencia}`}>
      <IonItem>
        <IonCheckbox
          slot="start"
          checked={compromisso.concluido}
          aria-label={`Marcar ${compromisso.titulo} como concluído`}
          onIonChange={() => onAlternar(compromisso)}
        />
        <span className="item-compromisso__icone" style={{ '--tipo-cor': tipo.cor } as React.CSSProperties}>
          <IonIcon icon={tipo.icone} aria-hidden="true" />
        </span>
        <IonLabel>
          <h3 className="item-compromisso__titulo">{compromisso.titulo}</h3>
          <p>
            {tipo.nome} · {materia?.nome ?? 'Matéria removida'}
          </p>
          <p className="item-compromisso__data">{formatarData(compromisso.data)}</p>
        </IonLabel>
        <IonNote slot="end" className="item-compromisso__prazo">
          {compromisso.concluido ? 'Concluído' : rotuloPrazo(compromisso.data)}
        </IonNote>
      </IonItem>

      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={remover}>
          <IonIcon slot="icon-only" icon={trashOutline} aria-label="Excluir compromisso" />
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
}

export default ItemCompromisso;
