import { IonContent, IonHeader, IonPage, IonSearchbar, IonSpinner, IonTitle, IonToolbar } from '@ionic/react';
import type { JSX } from 'react';
import { libraryOutline } from 'ionicons/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CartaoMateria from '../components/CartaoMateria';
import EstadoVazio from '../components/EstadoVazio';
import { useBoletim } from '../hooks/useBoletim';
import {
  calcularDesempenho,
  calcularFrequencia,
  contarPorSituacao,
  filtrarPorTexto,
  mediaGeral,
  ordenarMaterias,
} from '../utils/calculos';
import { formatarNota, primeiroNome } from '../utils/formato';
import './Semestre.css';

export function Semestre(): JSX.Element {
  const { materias, configuracao, carregando } = useBoletim();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => filtrarPorTexto(ordenarMaterias(materias), busca), [materias, busca]);
  const media = useMemo(() => mediaGeral(materias, configuracao), [materias, configuracao]);
  const contagem = useMemo(() => contarPorSituacao(materias, configuracao), [materias, configuracao]);

  const nome = primeiroNome(configuracao.nome);
  const emRisco = contagem.risco + contagem.reprovado_nota + contagem.reprovado_falta;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Semestre</IonTitle>
        </IonToolbar>
        {materias.length > 3 && (
          <IonToolbar>
            <IonSearchbar
              value={busca}
              placeholder="Buscar matéria"
              debounce={200}
              onIonInput={(evento) => setBusca(evento.detail.value ?? '')}
            />
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent className="semestre">
        {carregando ? (
          <div className="semestre__carregando">
            <IonSpinner name="crescent" aria-label="Carregando os dados salvos" />
          </div>
        ) : (
          <div className="semestre__corpo">
            <header className="semestre__painel">
              <p className="semestre__saudacao">{nome ? `Olá, ${nome}` : 'Seu semestre'}</p>
              <div className="semestre__indicadores">
                <div className="semestre__indicador">
                  <span className="semestre__numero">{media === null ? '--' : formatarNota(media)}</span>
                  <span className="semestre__rotulo">Média geral</span>
                </div>
                <div className="semestre__indicador">
                  <span className="semestre__numero">{materias.length}</span>
                  <span className="semestre__rotulo">{materias.length === 1 ? 'Matéria' : 'Matérias'}</span>
                </div>
                <div className="semestre__indicador">
                  <span className="semestre__numero">{emRisco}</span>
                  <span className="semestre__rotulo">Em alerta</span>
                </div>
              </div>
            </header>

            {materias.length === 0 ? (
              <EstadoVazio
                icone={libraryOutline}
                titulo="Nenhuma matéria cadastrada"
                descricao="Use a aba Matéria para cadastrar a primeira disciplina do semestre, com a carga horária e o professor."
              />
            ) : visiveis.length === 0 ? (
              <EstadoVazio
                icone={libraryOutline}
                titulo="Nenhum resultado"
                descricao="Nenhuma matéria corresponde ao que você buscou."
              />
            ) : (
              <div className="semestre__lista">
                {visiveis.map((materia) => (
                  <CartaoMateria
                    key={materia.id}
                    materia={materia}
                    desempenho={calcularDesempenho(materia, configuracao)}
                    frequencia={calcularFrequencia(materia, configuracao.limiteFaltas)}
                    limiteFaltas={configuracao.limiteFaltas}
                    onAbrir={(alvo) => navigate(`/semestre/${alvo.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}

export default Semestre;
