import { useEffect } from 'react';

import { useBoletim } from './useBoletim';

const CLASSE_ESCURA = 'ion-palette-dark';

export function useTema(): void {
  const { configuracao } = useBoletim();
  const { tema } = configuracao;

  useEffect(() => {
    const raiz = document.documentElement;

    if (tema !== 'sistema') {
      raiz.classList.toggle(CLASSE_ESCURA, tema === 'escuro');
      return;
    }

    const consulta = window.matchMedia('(prefers-color-scheme: dark)');
    const aplicar = (escuro: boolean) => raiz.classList.toggle(CLASSE_ESCURA, escuro);

    aplicar(consulta.matches);
    const aoMudar = (evento: MediaQueryListEvent) => aplicar(evento.matches);
    consulta.addEventListener('change', aoMudar);

    return () => consulta.removeEventListener('change', aoMudar);
  }, [tema]);
}
