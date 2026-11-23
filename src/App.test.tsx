import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import App from './App';

test('monta o app e mostra as quatro abas', async () => {
  render(<App />);

  expect(await screen.findByText('Semestre')).toBeInTheDocument();
  expect(screen.getByText('Agenda')).toBeInTheDocument();
  expect(screen.getByText('Matéria')).toBeInTheDocument();
  expect(screen.getByText('Ajustes')).toBeInTheDocument();
});
