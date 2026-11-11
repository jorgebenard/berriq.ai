import { describe, expect, it } from 'vitest';
import { FileSignature } from 'lucide-react';
import { appCategories, applications } from '../client/src/marketing/catalog';

describe('catálogo de aplicaciones', () => {
  it('incluye una única ficha de firma electrónica con icono y categoría visibles', () => {
    const matches = applications.filter((app) => app.id === 'electronic-signature');
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe('Firma electrónica');
    expect(matches[0].icon).toBe(FileSignature);
    expect(matches[0].category).toBe('operations');
    expect(appCategories.some((category) => category.id === matches[0].category)).toBe(true);
    expect(matches[0].keywords).toEqual(expect.arrayContaining(['firma digital', 'contratos', 'documentos']));
  });

  it('señala los límites de la propuesta sin prometer una firma operativa', () => {
    const app = applications.find((item) => item.id === 'electronic-signature');
    expect(app?.example).toContain('podría');
    expect(app?.verificationNotice).toContain('pendientes de confirmar');
    expect(app?.verificationNotice).toContain('validez legal');
    expect(app?.verificationNotice).toContain('no recibe ni firma documentos');
    expect(app?.connections.length).toBeGreaterThan(0);
  });
});
