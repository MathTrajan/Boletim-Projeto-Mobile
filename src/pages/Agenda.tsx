import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import type { JSX } from 'react';
import { addOutline, calendarNumberOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';

import AlertaConfirmacao from '../components/AlertaConfirmacao';
import EstadoVazio from '../components/EstadoVazio';
import ItemCompromisso from '../components/ItemCompromisso';
import { TIPOS_COMPROMISSO } from '../dados/catalogo';
import { useBoletim } from '../hooks/useBoletim';
import type { Compromisso, TipoCompromisso } from '../tipos';
import { compromissosAtrasados, ordenarCompromissos, ordenarMaterias } from '../utils/calculos';
import { formatarData, hojeISO } from '../utils/formato';
import './Agenda.css';

type Filtro = 'pendentes' | 'todos';

const LIMITE_TITULO = 50;

interface ErrosFormulario {
  titulo?: string;
  materia?: string;
}

export function Agenda(): JSX.Element {
  const {
    compromissos,
    materias,
    adicionarCompromisso,
    alternarCompromisso,
    removerCompromisso,
    buscarMateria,
  } = useBoletim();

  const [filtro, setFiltro] = useState<Filtro>('pendentes');
  const [aExcluir, setAExcluir] = useState<Compromisso | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [tipo, setTipo] = useState<TipoCompromisso>('prova');
  const [data, setData] = useState(hojeISO());
  const [erros, setErros] = useState<ErrosFormulario>({});

  const visiveis = useMemo(() => {
    const base = filtro === 'todos' ? compromissos : compromissos.filter((item) => !item.concluido);
    return ordenarCompromissos(base);
  }, [compromissos, filtro]);

  const atrasados = useMemo(() => compromissosAtrasados(compromissos), [compromissos]);
  const materiasOrdenadas = useMemo(() => ordenarMaterias(materias), [materias]);

  function abrirModal(): void {
    setTitulo('');
    setMateriaId(materiasOrdenadas[0]?.id ?? '');
    setTipo('prova');
    setData(hojeISO());
    setErros({});
    setModalAberto(true);
  }

  function salvar(): void {
    const encontrados: ErrosFormulario = {};
    if (!titulo.trim()) encontrados.titulo = 'Informe o título.';
    if (!materiaId) encontrados.materia = 'Escolha a matéria.';

    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    adicionarCompromisso({ titulo: titulo.trim(), materiaId, tipo, data });
    setModalAberto(false);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Agenda</IonTitle>
          <IonButtons slot="end">
            <IonButton aria-label="Novo compromisso" disabled={materias.length === 0} onClick={abrirModal}>
              <IonIcon slot="icon-only" icon={addOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={filtro} onIonChange={(e) => setFiltro(e.detail.value as Filtro)}>
            <IonSegmentButton value="pendentes">
              <IonLabel>Pendentes</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="todos">
              <IonLabel>Todos</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="agenda">
        {atrasados.length > 0 && (
          <p className="agenda__alerta">
            {atrasados.length} {atrasados.length === 1 ? 'compromisso atrasado' : 'compromissos atrasados'}
          </p>
        )}

        {visiveis.length === 0 ? (
          <EstadoVazio
            icone={calendarNumberOutline}
            titulo={materias.length === 0 ? 'Cadastre uma matéria primeiro' : 'Agenda vazia'}
            descricao={
              materias.length === 0
                ? 'Todo compromisso pertence a uma matéria, então comece cadastrando as disciplinas do semestre.'
                : 'Use o botão de adicionar no topo para registrar uma prova, um trabalho ou uma apresentação.'
            }
          />
        ) : (
          <IonList lines="full">
            {visiveis.map((compromisso) => (
              <ItemCompromisso
                key={compromisso.id}
                compromisso={compromisso}
                materia={buscarMateria(compromisso.materiaId)}
                onAlternar={(alvo) => alternarCompromisso(alvo.id)}
                onRemover={setAExcluir}
              />
            ))}
          </IonList>
        )}

        <IonModal
          className="agenda__modal"
          isOpen={modalAberto}
          onDidDismiss={() => setModalAberto(false)}
          initialBreakpoint={0.9}
          breakpoints={[0, 0.9, 1]}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Novo compromisso</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setModalAberto(false)}>Cancelar</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="agenda__formulario">
              <IonList inset lines="full">
                <IonItem>
                  <IonInput
                    label="Título"
                    labelPlacement="stacked"
                    placeholder="Prova bimestral, entrega do artigo"
                    maxlength={LIMITE_TITULO}
                    value={titulo}
                    className={erros.titulo ? 'ion-invalid ion-touched' : ''}
                    errorText={erros.titulo}
                    onIonInput={(e) => setTitulo(e.detail.value ?? '')}
                  />
                </IonItem>
                <IonItem>
                  <IonSelect
                    label="Matéria"
                    labelPlacement="stacked"
                    placeholder="Escolha"
                    value={materiaId}
                    className={erros.materia ? 'ion-invalid ion-touched' : ''}
                    onIonChange={(e) => setMateriaId(e.detail.value as string)}
                  >
                    {materiasOrdenadas.map((materia) => (
                      <IonSelectOption key={materia.id} value={materia.id}>
                        {materia.nome}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                <IonItem>
                  <IonSelect
                    label="Tipo"
                    labelPlacement="stacked"
                    value={tipo}
                    onIonChange={(e) => setTipo(e.detail.value as TipoCompromisso)}
                  >
                    {TIPOS_COMPROMISSO.map((item) => (
                      <IonSelectOption key={item.id} value={item.id}>
                        {item.nome}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonList>

              <div className="agenda__data">
                <span className="agenda__data-rotulo">Data: {formatarData(data)}</span>
                <IonDatetime
                  presentation="date"
                  locale="pt-BR"
                  value={data}
                  size="cover"
                  onIonChange={(e) => {
                    const escolhido = e.detail.value;
                    if (typeof escolhido === 'string') setData(escolhido.slice(0, 10));
                  }}
                />
              </div>

              <IonButton expand="block" onClick={salvar}>
                Adicionar à agenda
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <AlertaConfirmacao
          aberto={aExcluir !== null}
          titulo="Excluir compromisso"
          mensagem={`"${aExcluir?.titulo ?? ''}" será removido da agenda.`}
          onCancelar={() => setAExcluir(null)}
          onConfirmar={() => {
            if (aExcluir) removerCompromisso(aExcluir.id);
          }}
        />
      </IonContent>
    </IonPage>
  );
}

export default Agenda;
