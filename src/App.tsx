import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { addCircleOutline, calendarNumberOutline, libraryOutline, settingsOutline } from 'ionicons/icons';
import { Navigate, Route } from 'react-router-dom';

import { BoletimProvider } from './contextos/BoletimContext';
import { useTema } from './hooks/useTema';
import Agenda from './pages/Agenda';
import Ajustes from './pages/Ajustes';
import DetalheMateria from './pages/DetalheMateria';
import FormularioMateria from './pages/FormularioMateria';
import Semestre from './pages/Semestre';

import '@ionic/react/css/core.css';

import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.class.css';

import './theme/variables.css';

setupIonicReact();

function Navegacao() {
  useTema();

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route path="/semestre" element={<Semestre />} />
          <Route path="/semestre/:id" element={<DetalheMateria />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/materia" element={<FormularioMateria />} />
          <Route path="/materia/:id" element={<FormularioMateria />} />
          <Route path="/ajustes" element={<Ajustes />} />
          <Route path="/" element={<Navigate to="/semestre" replace />} />
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          <IonTabButton tab="semestre" href="/semestre">
            <IonIcon aria-hidden="true" icon={libraryOutline} />
            <IonLabel>Semestre</IonLabel>
          </IonTabButton>
          <IonTabButton tab="agenda" href="/agenda">
            <IonIcon aria-hidden="true" icon={calendarNumberOutline} />
            <IonLabel>Agenda</IonLabel>
          </IonTabButton>
          <IonTabButton tab="materia" href="/materia">
            <IonIcon aria-hidden="true" icon={addCircleOutline} />
            <IonLabel>Matéria</IonLabel>
          </IonTabButton>
          <IonTabButton tab="ajustes" href="/ajustes">
            <IonIcon aria-hidden="true" icon={settingsOutline} />
            <IonLabel>Ajustes</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
}

const App: React.FC = () => (
  <IonApp>
    <BoletimProvider>
      <Navegacao />
    </BoletimProvider>
  </IonApp>
);

export default App;
