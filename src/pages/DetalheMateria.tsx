import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import type { JSX } from 'react';
import { addOutline, clipboardOutline, createOutline, removeOutline, trashOutline } from 'ionicons/icons';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import AlertaConfirmacao from '../components/AlertaConfirmacao';
import BarraFaltas from '../components/BarraFaltas';
import EstadoVazio from '../components/EstadoVazio';
import EtiquetaSituacao from '../components/EtiquetaSituacao';
import ItemAvaliacao from '../components/ItemAvaliacao';
import ItemCompromisso from '../components/ItemCompromisso';
import ModalAvaliacao from '../components/ModalAvaliacao';
import { useBoletim } from '../hooks/useBoletim';
import type { Avaliacao } from '../tipos';
import { calcularDesempenho, calcularFrequencia, compromissosDaMateria } from '../utils/calculos';
import { formatarNota } from '../utils/formato';
import './DetalheMateria.css';

export function DetalheMateria(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    buscarMateria,
    compromissos,
    configuracao,
    carregando,
    registrarFalta,
    salvarAvaliacao,
    removerAvaliacao,
    removerMateria,
    alternarCompromisso,
    removerCompromisso,
  } = useBoletim();

  const [editandoAvaliacao, setEditandoAvaliacao] = useState<Avaliacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [avaliacaoAExcluir, setAvaliacaoAExcluir] = useState<Avaliacao | null>(null);
  const [excluindoMateria, setExcluindoMateria] = useState(false);

  const materia = id ? buscarMateria(id) : undefined;

  if (carregando) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/semestre" text="Voltar" />
            </IonButtons>
            <IonTitle>Matéria</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent />
      </IonPage>
    );
  }

  if (!materia) {
    return <Navigate to="/semestre" replace />;
  }

  const desempenho = calcularDesempenho(materia, configuracao);
  const frequencia = calcularFrequencia(materia, configuracao.limiteFaltas);
  const daMateria = compromissosDaMateria(compromissos, materia.id);

  function abrirNovaAvaliacao(): void {
    setEditandoAvaliacao(null);
    setModalAberto(true);
  }

  function abrirEdicao(avaliacao: Avaliacao): void {
    setEditandoAvaliacao(avaliacao);
    setModalAberto(true);
  }

  function textoDaMeta(): string {
    if (desempenho.notaNecessaria === null) {
      return 'Todas as avaliações já foram lançadas.';
    }
    if (desempenho.notaNecessaria <= 0) {
      return 'A média mínima já está garantida.';
    }
    if (desempenho.notaNecessaria > 10) {
      return 'A média mínima não é mais alcançável pelas avaliações restantes.';
    }
    return `Precisa de ${formatarNota(desempenho.notaNecessaria)} nas avaliações que faltam.`;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/semestre" text="Voltar" />
          </IonButtons>
          <IonTitle>{materia.nome}</IonTitle>
          <IonButtons slot="end">
            <IonButton aria-label="Editar matéria" onClick={() => navigate(`/materia/${materia.id}`)}>
              <IonIcon slot="icon-only" icon={createOutline} />
            </IonButton>
            <IonButton color="danger" aria-label="Excluir matéria" onClick={() => setExcluindoMateria(true)}>
              <IonIcon slot="icon-only" icon={trashOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="detalhe">
        <div className="detalhe__corpo">
          <header className="detalhe__capa" style={{ '--materia-cor': materia.cor } as React.CSSProperties}>
            <div className="detalhe__capa-topo">
              <div className="detalhe__identificacao">
                <h2 className="detalhe__nome">{materia.nome}</h2>
                <p className="detalhe__professor">{materia.professor || 'Professor não informado'}</p>
              </div>
              <EtiquetaSituacao situacao={desempenho.situacao} />
            </div>
            <div className="detalhe__media">
              <span className="detalhe__media-numero">
                {desempenho.mediaParcial === null ? '--' : formatarNota(desempenho.mediaParcial)}
              </span>
              <span className="detalhe__media-rotulo">
                média parcial, mínimo {formatarNota(configuracao.mediaMinima)}
              </span>
            </div>
            <p className="detalhe__meta">{textoDaMeta()}</p>
          </header>

          <section className="detalhe__secao">
            <h3 className="detalhe__titulo-secao">Frequência</h3>
            <BarraFaltas
              faltas={materia.faltas}
              frequencia={frequencia}
              limiteFaltas={configuracao.limiteFaltas}
            />
            <div className="detalhe__contador">
              <IonButton
                fill="outline"
                size="default"
                aria-label="Remover uma falta"
                disabled={materia.faltas === 0}
                onClick={() => registrarFalta(materia.id, -1)}
              >
                <IonIcon slot="icon-only" icon={removeOutline} />
              </IonButton>
              <div className="detalhe__contador-valor">
                <strong>{materia.faltas}</strong>
                <span>de {materia.aulasPrevistas} aulas</span>
              </div>
              <IonButton
                fill="solid"
                size="default"
                aria-label="Registrar uma falta"
                onClick={() => registrarFalta(materia.id, 1)}
              >
                <IonIcon slot="icon-only" icon={addOutline} />
              </IonButton>
            </div>
          </section>

          <section className="detalhe__secao detalhe__secao--lista">
            <div className="detalhe__cabecalho-lista">
              <h3 className="detalhe__titulo-secao">Avaliações</h3>
              <IonButton size="small" fill="clear" onClick={abrirNovaAvaliacao}>
                <IonIcon slot="start" icon={addOutline} />
                Adicionar
              </IonButton>
            </div>
            {materia.avaliacoes.length === 0 ? (
              <EstadoVazio
                icone={clipboardOutline}
                titulo="Nenhuma avaliação"
                descricao="Cadastre as provas e trabalhos com o peso de cada um para o app calcular a média."
              />
            ) : (
              <IonList lines="full">
                {materia.avaliacoes.map((avaliacao) => (
                  <ItemAvaliacao
                    key={avaliacao.id}
                    avaliacao={avaliacao}
                    mediaMinima={configuracao.mediaMinima}
                    onEditar={abrirEdicao}
                    onRemover={setAvaliacaoAExcluir}
                  />
                ))}
              </IonList>
            )}
          </section>

          {daMateria.length > 0 && (
            <section className="detalhe__secao detalhe__secao--lista">
              <h3 className="detalhe__titulo-secao">Na agenda</h3>
              <IonList lines="full">
                {daMateria.map((compromisso) => (
                  <ItemCompromisso
                    key={compromisso.id}
                    compromisso={compromisso}
                    materia={materia}
                    onAlternar={(alvo) => alternarCompromisso(alvo.id)}
                    onRemover={(alvo) => removerCompromisso(alvo.id)}
                  />
                ))}
              </IonList>
            </section>
          )}
        </div>

        <ModalAvaliacao
          aberto={modalAberto}
          avaliacao={editandoAvaliacao}
          onFechar={() => setModalAberto(false)}
          onSalvar={(dados) => salvarAvaliacao(materia.id, dados)}
        />

        <AlertaConfirmacao
          aberto={avaliacaoAExcluir !== null}
          titulo="Excluir avaliação"
          mensagem={`"${avaliacaoAExcluir?.nome ?? ''}" será removida e a média vai ser recalculada.`}
          onCancelar={() => setAvaliacaoAExcluir(null)}
          onConfirmar={() => {
            if (avaliacaoAExcluir) removerAvaliacao(materia.id, avaliacaoAExcluir.id);
          }}
        />

        <AlertaConfirmacao
          aberto={excluindoMateria}
          titulo="Excluir matéria"
          mensagem={`"${materia.nome}" será apagada junto com as avaliações e os compromissos dela.`}
          onCancelar={() => setExcluindoMateria(false)}
          onConfirmar={() => {
            removerMateria(materia.id);
            navigate('/semestre', { replace: true });
          }}
        />
      </IonContent>
    </IonPage>
  );
}

export default DetalheMateria;
