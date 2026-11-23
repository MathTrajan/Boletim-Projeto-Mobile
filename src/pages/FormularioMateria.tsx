import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import type { JSX } from 'react';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { CORES_MATERIA } from '../dados/catalogo';
import { useBoletim } from '../hooks/useBoletim';
import type { DadosMateria, Materia } from '../tipos';
import './FormularioMateria.css';

const LIMITE_NOME = 50;
const LIMITE_PROFESSOR = 50;
const AULAS_PADRAO = 80;

interface EstadoFormulario {
  chave: string;
  nome: string;
  professor: string;
  aulasTexto: string;
  cor: string;
}

interface Erros {
  nome?: string;
  aulas?: string;
}

function formularioVazio(): EstadoFormulario {
  return {
    chave: '',
    nome: '',
    professor: '',
    aulasTexto: String(AULAS_PADRAO),
    cor: CORES_MATERIA[0],
  };
}

function formularioDe(materia: Materia): EstadoFormulario {
  return {
    chave: materia.id,
    nome: materia.nome,
    professor: materia.professor,
    aulasTexto: String(materia.aulasPrevistas),
    cor: materia.cor,
  };
}

export function FormularioMateria(): JSX.Element {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { adicionarMateria, atualizarMateria, buscarMateria, configuracao, carregando } = useBoletim();

  const [form, setForm] = useState<EstadoFormulario>(formularioVazio);
  const [erros, setErros] = useState<Erros>({});
  const [aviso, setAviso] = useState('');

  const editando = Boolean(id);
  const chaveDaRota = id ?? '';
  const emEdicao = id ? buscarMateria(id) : undefined;

  if (!carregando && form.chave !== chaveDaRota) {
    if (!id) {
      setForm(formularioVazio());
      setErros({});
    } else if (emEdicao) {
      setForm(formularioDe(emEdicao));
      setErros({});
    }
  }

  if (!carregando && id && !emEdicao) {
    return <Navigate to="/semestre" replace />;
  }

  function alterar(parcial: Partial<EstadoFormulario>): void {
    setForm((atual) => ({ ...atual, ...parcial }));
  }

  function validar(): Erros {
    const encontrados: Erros = {};
    const aulas = Number(form.aulasTexto);

    if (!form.nome.trim()) {
      encontrados.nome = 'Informe o nome da matéria.';
    }

    if (!form.aulasTexto.trim() || !Number.isFinite(aulas) || aulas <= 0) {
      encontrados.aulas = 'Informe quantas aulas a matéria tem no semestre.';
    } else if (aulas > 1000) {
      encontrados.aulas = 'O máximo é 1000 aulas.';
    }

    return encontrados;
  }

  function salvar(): void {
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) {
      setAviso('Confira os campos destacados.');
      return;
    }

    const dados: DadosMateria = {
      nome: form.nome.trim(),
      professor: form.professor.trim(),
      aulasPrevistas: Math.round(Number(form.aulasTexto)),
      cor: form.cor,
    };

    if (id) {
      atualizarMateria(id, dados);
      setForm(formularioVazio());
      navigate(`/semestre/${id}`, { replace: true });
      return;
    }

    adicionarMateria(dados);
    setForm(formularioVazio());
    navigate('/semestre', { replace: true });
  }

  const aulas = Number(form.aulasTexto);
  const previaFaltas =
    Number.isFinite(aulas) && aulas > 0
      ? `Com o limite de ${configuracao.limiteFaltas}% definido nos ajustes, dá para faltar ${Math.floor((aulas * configuracao.limiteFaltas) / 100)} aulas nesta matéria.`
      : 'Informe quantas aulas a matéria tem para o app calcular o limite de faltas.';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{editando ? 'Editar matéria' : 'Nova matéria'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="formulario-materia">
        <div className="formulario-materia__corpo">
          <IonList inset lines="full">
            <IonItem>
              <IonInput
                label="Nome da matéria"
                labelPlacement="stacked"
                placeholder="Desenvolvimento para Dispositivos Móveis"
                maxlength={LIMITE_NOME}
                value={form.nome}
                className={erros.nome ? 'ion-invalid ion-touched' : ''}
                errorText={erros.nome}
                onIonInput={(e) => alterar({ nome: e.detail.value ?? '' })}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Professor"
                labelPlacement="stacked"
                placeholder="Opcional"
                maxlength={LIMITE_PROFESSOR}
                value={form.professor}
                onIonInput={(e) => alterar({ professor: e.detail.value ?? '' })}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Aulas no semestre"
                labelPlacement="stacked"
                type="number"
                inputmode="numeric"
                placeholder={String(AULAS_PADRAO)}
                value={form.aulasTexto}
                className={erros.aulas ? 'ion-invalid ion-touched' : ''}
                errorText={erros.aulas}
                onIonInput={(e) => alterar({ aulasTexto: e.detail.value ?? '' })}
              />
            </IonItem>
          </IonList>

          <IonNote className="formulario-materia__dica">{previaFaltas}</IonNote>

          <section className="formulario-materia__secao">
            <h2 className="formulario-materia__titulo-secao">Cor</h2>
            <div className="formulario-materia__cores" role="radiogroup" aria-label="Cor da matéria">
              {CORES_MATERIA.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  role="radio"
                  aria-checked={form.cor === cor}
                  aria-label={`Cor ${cor}`}
                  className={`formulario-materia__cor${form.cor === cor ? ' formulario-materia__cor--ativa' : ''}`}
                  style={{ '--amostra': cor } as React.CSSProperties}
                  onClick={() => alterar({ cor })}
                />
              ))}
            </div>
          </section>

          <IonButton expand="block" size="large" onClick={salvar}>
            <IonIcon slot="start" icon={checkmarkCircleOutline} />
            {editando ? 'Salvar alterações' : 'Cadastrar matéria'}
          </IonButton>

          {editando && (
            <IonButton expand="block" fill="clear" onClick={() => navigate(`/semestre/${id}`)}>
              Cancelar
            </IonButton>
          )}
        </div>

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

export default FormularioMateria;
