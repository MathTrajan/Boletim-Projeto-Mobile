import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonPage,
  IonRange,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import type { JSX } from 'react';
import { peopleOutline, phonePortraitOutline, trashOutline } from 'ionicons/icons';
import { useState } from 'react';

import AlertaConfirmacao from '../components/AlertaConfirmacao';
import { useBoletim } from '../hooks/useBoletim';
import type { PreferenciaTema } from '../tipos';
import { formatarNota, formatarPercentual } from '../utils/formato';
import './Ajustes.css';

const INTEGRANTES = ['Matheus Trajano', 'Marcos Vinícius Moreira da Silva', 'Diego de Jesus Modesto Silva'];

const LIMITE_NOME = 40;

export function Ajustes(): JSX.Element {
  const { configuracao, materias, compromissos, carregando, atualizarConfiguracao, limparDados } =
    useBoletim();
  const [confirmandoLimpeza, setConfirmandoLimpeza] = useState(false);
  const [aviso, setAviso] = useState('');

  const [mediaDigitada, setMediaDigitada] = useState<string | null>(null);
  const mediaSalva = String(configuracao.mediaMinima).replace('.', ',');
  const mediaTexto = mediaDigitada ?? (carregando ? '' : mediaSalva);

  function mudarMedia(texto: string): void {
    setMediaDigitada(texto);
    const numero = Number(texto.replace(/\s/g, '').replace(',', '.'));
    if (Number.isFinite(numero) && numero >= 0 && numero <= 10) {
      atualizarConfiguracao({ mediaMinima: numero });
    }
  }

  async function apagar(): Promise<void> {
    await limparDados();
    setMediaDigitada(null);
    setAviso('Todos os dados do app foram apagados.');
  }

  const totalAvaliacoes = materias.reduce((total, materia) => total + materia.avaliacoes.length, 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ajustes">
        <IonList inset lines="full">
          <IonListHeader>
            <IonLabel>Perfil</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonInput
              label="Seu nome"
              labelPlacement="stacked"
              placeholder="Como quer ser chamado"
              maxlength={LIMITE_NOME}
              value={configuracao.nome}
              onIonInput={(e) => atualizarConfiguracao({ nome: e.detail.value ?? '' })}
            />
          </IonItem>
        </IonList>

        <IonList inset lines="full">
          <IonListHeader>
            <IonLabel>Regras do curso</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonInput
              label="Média mínima para aprovação"
              labelPlacement="stacked"
              type="text"
              inputmode="decimal"
              placeholder="6,0"
              value={mediaTexto}
              onIonInput={(e) => mudarMedia(e.detail.value ?? '')}
            />
          </IonItem>
          <IonItem lines="none">
            <IonLabel position="stacked">
              Limite de faltas: {formatarPercentual(configuracao.limiteFaltas)} das aulas
            </IonLabel>
            <IonRange
              className="ajustes__faixa"
              min={5}
              max={50}
              step={5}
              snaps
              ticks={false}
              value={configuracao.limiteFaltas}
              aria-label="Limite de faltas em porcentagem"
              onIonChange={(e) => atualizarConfiguracao({ limiteFaltas: e.detail.value as number })}
            />
          </IonItem>
          <IonItem lines="none">
            <IonNote className="ajustes__dica">
              O padrão brasileiro é 25%, o que equivale a faltar um quarto das aulas. A média mínima atual é{' '}
              {formatarNota(configuracao.mediaMinima)}.
            </IonNote>
          </IonItem>
        </IonList>

        <IonList inset lines="none">
          <IonListHeader>
            <IonLabel>Aparência</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonSegment
              value={configuracao.tema}
              onIonChange={(e) => atualizarConfiguracao({ tema: e.detail.value as PreferenciaTema })}
            >
              <IonSegmentButton value="sistema">
                <IonLabel>Sistema</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="claro">
                <IonLabel>Claro</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="escuro">
                <IonLabel>Escuro</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonItem>
        </IonList>

        <IonList inset lines="full">
          <IonListHeader>
            <IonLabel>Dados salvos</IonLabel>
          </IonListHeader>
          <IonItem lines="none">
            <IonLabel>
              <h3>
                {materias.length} {materias.length === 1 ? 'matéria' : 'matérias'}, {totalAvaliacoes}{' '}
                {totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'} e {compromissos.length}{' '}
                {compromissos.length === 1 ? 'compromisso' : 'compromissos'}
              </h3>
              <p>
                Tudo fica apenas neste aparelho, no armazenamento do próprio aplicativo, via
                @capacitor/preferences.
              </p>
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonButton
              expand="block"
              color="danger"
              fill="outline"
              className="ajustes__botao-apagar"
              disabled={materias.length === 0 && compromissos.length === 0}
              onClick={() => setConfirmandoLimpeza(true)}
            >
              <IonIcon slot="start" icon={trashOutline} />
              Apagar todos os dados
            </IonButton>
          </IonItem>
        </IonList>

        <IonList inset lines="full">
          <IonListHeader>
            <IonLabel>Sobre o aplicativo</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonIcon slot="start" icon={phonePortraitOutline} aria-hidden="true" color="primary" />
            <IonLabel>
              <h3>Boletim, versão 1.0.0</h3>
              <p>Ionic 9 com React, persistência em @capacitor/preferences.</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonIcon slot="start" icon={peopleOutline} aria-hidden="true" color="primary" />
            <IonLabel>
              <h3>Integrantes</h3>
              {INTEGRANTES.map((integrante) => (
                <p key={integrante}>{integrante}</p>
              ))}
            </IonLabel>
          </IonItem>
          <IonItem lines="none">
            <IonLabel>
              <h3>Disciplina</h3>
              <p>Desenvolvimento para Dispositivos Móveis</p>
              <p>Professor Gabriel de Oliveira Silva</p>
              <p>Projeto A2, entrega em 01/12</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <AlertaConfirmacao
          aberto={confirmandoLimpeza}
          titulo="Apagar todos os dados"
          mensagem="As matérias, as avaliações, a agenda e os ajustes serão removidos deste aparelho. Não há como desfazer."
          textoConfirmar="Apagar"
          onCancelar={() => setConfirmandoLimpeza(false)}
          onConfirmar={apagar}
        />

        <IonToast
          isOpen={aviso.length > 0}
          message={aviso}
          duration={2200}
          position="top"
          onDidDismiss={() => setAviso('')}
        />
      </IonContent>
    </IonPage>
  );
}

export default Ajustes;
