import { IonBadge } from '@ionic/react';
import type { JSX } from 'react';

import { descreverSituacao } from '../dados/catalogo';
import type { Situacao } from '../tipos';
import './EtiquetaSituacao.css';

interface EtiquetaSituacaoProps {
  situacao: Situacao;
}

export function EtiquetaSituacao({ situacao }: EtiquetaSituacaoProps): JSX.Element {
  const { nome, cor } = descreverSituacao(situacao);

  return (
    <IonBadge className="etiqueta-situacao" color={cor}>
      {nome}
    </IonBadge>
  );
}

export default EtiquetaSituacao;
