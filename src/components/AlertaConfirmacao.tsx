import { IonAlert } from '@ionic/react';
import type { JSX } from 'react';

interface AlertaConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  onCancelar: () => void;
  onConfirmar: () => void;
}

export function AlertaConfirmacao({
  aberto,
  titulo,
  mensagem,
  textoConfirmar = 'Excluir',
  onCancelar,
  onConfirmar,
}: AlertaConfirmacaoProps): JSX.Element {
  return (
    <IonAlert
      isOpen={aberto}
      header={titulo}
      message={mensagem}
      onDidDismiss={onCancelar}
      buttons={[
        { text: 'Cancelar', role: 'cancel' },
        { text: textoConfirmar, role: 'destructive', handler: onConfirmar },
      ]}
    />
  );
}

export default AlertaConfirmacao;
