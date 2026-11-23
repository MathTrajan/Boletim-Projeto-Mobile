import { IonIcon } from '@ionic/react';
import type { JSX, ReactNode } from 'react';

import './EstadoVazio.css';

interface EstadoVazioProps {
  icone: string;
  titulo: string;
  descricao: string;
  children?: ReactNode;
}

export function EstadoVazio({ icone, titulo, descricao, children }: EstadoVazioProps): JSX.Element {
  return (
    <div className="estado-vazio">
      <IonIcon className="estado-vazio__icone" icon={icone} aria-hidden="true" />
      <h2 className="estado-vazio__titulo">{titulo}</h2>
      <p className="estado-vazio__descricao">{descricao}</p>
      {children}
    </div>
  );
}

export default EstadoVazio;
