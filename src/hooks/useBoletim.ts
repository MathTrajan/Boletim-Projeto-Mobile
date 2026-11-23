import { useContext } from 'react';

import { BoletimContext } from '../contextos/boletimContexto';
import type { ValorBoletim } from '../contextos/boletimContexto';

export function useBoletim(): ValorBoletim {
  const contexto = useContext(BoletimContext);
  if (!contexto) {
    throw new Error('useBoletim precisa estar dentro de <BoletimProvider>.');
  }
  return contexto;
}
