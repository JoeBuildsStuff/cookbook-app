import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

export function renderEmail(component: React.ReactElement) {
  return renderToStaticMarkup(component);
}

