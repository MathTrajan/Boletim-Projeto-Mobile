import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModal,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import type { JSX } from 'react';
import { useState } from 'react';

import type { Avaliacao } from '../tipos';
import './ModalAvaliacao.css';

interface ModalAvaliacaoProps {
  aberto: boolean;
  avaliacao: Avaliacao | null;
  onFechar: () => void;
  onSalvar: (dados: Omit<Avaliacao, 'id'> & { id?: string }) => void;
}

interface Erros {
  nome?: string;
  peso?: string;
  nota?: string;
}

const LIMITE_NOME = 40;

function paraNumero(texto: string): number {
  return Number(texto.replace(/\s/g, '').replace(',', '.'));
}

export function ModalAvaliacao({ aberto, avaliacao, onFechar, onSalvar }: ModalAvaliacaoProps): JSX.Element {
  const [chave, setChave] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [peso, setPeso] = useState('1');
  const [nota, setNota] = useState('');
  const [erros, setErros] = useState<Erros>({});

  const chaveAtual = aberto ? (avaliacao?.id ?? 'nova') : null;

  if (chave !== chaveAtual) {
    setChave(chaveAtual);
    setNome(avaliacao?.nome ?? '');
    setPeso(avaliacao ? String(avaliacao.peso).replace('.', ',') : '1');
    setNota(avaliacao?.nota !== null && avaliacao ? String(avaliacao.nota).replace('.', ',') : '');
    setErros({});
  }

  function validar(): Erros {
    const encontrados: Erros = {};
    const pesoNumero = paraNumero(peso);
    const notaNumero = paraNumero(nota);

    if (!nome.trim()) {
      encontrados.nome = 'Informe o nome da avaliação.';
    }

    if (!peso.trim() || !Number.isFinite(pesoNumero) || pesoNumero <= 0) {
      encontrados.peso = 'O peso precisa ser maior que zero.';
    } else if (pesoNumero > 100) {
      encontrados.peso = 'O peso máximo é 100.';
    }

    if (nota.trim() && (!Number.isFinite(notaNumero) || notaNumero < 0 || notaNumero > 10)) {
      encontrados.nota = 'A nota vai de 0 a 10.';
    }

    return encontrados;
  }

  function salvar(): void {
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    onSalvar({
      id: avaliacao?.id,
      nome: nome.trim(),
      peso: Math.round(paraNumero(peso) * 10) / 10,
      nota: nota.trim() ? Math.round(paraNumero(nota) * 10) / 10 : null,
    });
    onFechar();
  }

  return (
    <IonModal
      className="modal-avaliacao"
      isOpen={aberto}
      onDidDismiss={onFechar}
      initialBreakpoint={0.72}
      breakpoints={[0, 0.72, 1]}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{avaliacao ? 'Editar avaliação' : 'Nova avaliação'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onFechar}>Cancelar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="modal-avaliacao__corpo">
          <IonList inset lines="full">
            <IonItem>
              <IonInput
                label="Nome"
                labelPlacement="stacked"
                placeholder="Prova 1, Trabalho, Seminário"
                maxlength={LIMITE_NOME}
                value={nome}
                className={erros.nome ? 'ion-invalid ion-touched' : ''}
                errorText={erros.nome}
                onIonInput={(e) => setNome(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Peso"
                labelPlacement="stacked"
                type="text"
                inputmode="decimal"
                placeholder="1"
                value={peso}
                className={erros.peso ? 'ion-invalid ion-touched' : ''}
                errorText={erros.peso}
                onIonInput={(e) => setPeso(e.detail.value ?? '')}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Nota"
                labelPlacement="stacked"
                type="text"
                inputmode="decimal"
                placeholder="Deixe vazio se ainda não saiu"
                value={nota}
                className={erros.nota ? 'ion-invalid ion-touched' : ''}
                errorText={erros.nota}
                onIonInput={(e) => setNota(e.detail.value ?? '')}
              />
            </IonItem>
          </IonList>

          <IonNote className="modal-avaliacao__dica">
            O peso define quanto a avaliação vale na média. Avaliação sem nota entra no cálculo da nota que
            você ainda precisa tirar.
          </IonNote>

          <IonButton expand="block" onClick={salvar}>
            {avaliacao ? 'Salvar alterações' : 'Adicionar avaliação'}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
}

export default ModalAvaliacao;
