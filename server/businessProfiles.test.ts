import { afterEach, describe, expect, it } from 'vitest';
import { industries } from '../client/src/marketing/catalog';
import {
  getVerifiedBusinessProfile,
  industryConversation,
  verifiedBusinessProfiles,
  type VerifiedBusinessProfile,
} from '../client/src/marketing/businessProfiles';

afterEach(() => { verifiedBusinessProfiles.splice(0); });

const sample: VerifiedBusinessProfile = {
  industryId: 'fitness', businessName: 'Gimnasios', headline: 'Encabezado de prueba',
  description: 'Texto de prueba', exampleButtonLabel: 'Ver ejemplo',
  tasks: ['Tarea uno', 'Tarea dos', 'Tarea tres'], journeyId: 'membresias',
  steps: Array.from({ length: 4 }, (_, i) => ({ label: `Paso ${i}`, title: `Título ${i}`, description: `Descripción ${i}`, fields: [], next: 'Siguiente' })),
  verificationSource: 'Fuente de prueba',
};

describe('validación de perfiles de negocios', () => {
  it('mantiene los 16 sectores con una pregunta de conversación', () => {
    expect(industries).toHaveLength(16);
    for (const industry of industries) expect(industryConversation[industry.id]).toBeTruthy();
  });

  it('no presenta como verificados perfiles sin fuente de producto', () => {
    for (const industry of industries) {
      for (const businessName of industry.businesses) {
        expect(getVerifiedBusinessProfile({ industryId: industry.id, businessName })).toBeUndefined();
      }
    }
  });

  it('rechaza un perfil incompleto o sin una fuente explícita', () => {
    verifiedBusinessProfiles.push({ ...sample, verificationSource: '' });
    expect(getVerifiedBusinessProfile(sample)).toBeUndefined();
    verifiedBusinessProfiles[0] = { ...sample, tasks: ['Una'] };
    expect(getVerifiedBusinessProfile(sample)).toBeUndefined();
    verifiedBusinessProfiles[0] = { ...sample, steps: sample.steps.slice(0, 3) };
    expect(getVerifiedBusinessProfile(sample)).toBeUndefined();
  });

  it('exige coincidencia de negocio y sector, incluso para nombres repetidos', () => {
    verifiedBusinessProfiles.push(sample);
    expect(getVerifiedBusinessProfile({ industryId: 'fitness', businessName: 'Gimnasios' })).toEqual(sample);
    expect(getVerifiedBusinessProfile({ industryId: 'sports', businessName: 'Gimnasios' })).toBeUndefined();
    expect(getVerifiedBusinessProfile(null)).toBeUndefined();
  });
});
