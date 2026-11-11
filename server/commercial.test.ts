import { describe, expect, it } from 'vitest';
import { calculateCapacityQuote, COMMERCIAL_PLANS } from '../client/src/marketing/commercial';

describe('comparador de capacidad berriq', () => {
  it('conserva las tarifas, usuarios y sedes proporcionados', () => {
    expect(COMMERCIAL_PLANS.map(({ id, monthlyPrice, includedUsers, includedLocations }) => [id, monthlyPrice, includedUsers, includedLocations])).toEqual([
      ['start', 1490, 5, 1], ['grow', 2990, 15, 3], ['enterprise', 5990, 30, 5],
    ]);
  });

  it.each([
    [5, 1, 'start', 1490],
    [6, 1, 'start', 1980],
    [15, 3, 'grow', 2990],
    [30, 5, 'enterprise', 5990],
    [31, 5, 'enterprise', 6480],
  ])('elige la opción de menor coste para %s usuarios y %s sedes', (users, locations, plan, price) => {
    const quote = calculateCapacityQuote({ users: Number(users), locations: Number(locations) });
    expect(quote.cheapestOptions[0].plan.id).toBe(plan);
    expect(quote.cheapestOptions[0].total).toBe(price);
  });

  it('compara independientemente los tres planes en 3.000 configuraciones', () => {
    for (let users = 1; users <= 150; users++) {
      for (let locations = 1; locations <= 20; locations++) {
        const totals = [[1490, 5, 1], [2990, 15, 3], [5990, 30, 5]].map(([base, includedUsers, includedLocations]) =>
          base + Math.ceil(Math.max(0, users - includedUsers) / 5) * 490 + Math.max(0, locations - includedLocations) * 790,
        );
        const quote = calculateCapacityQuote({ users, locations });
        expect(quote.cheapestOptions.every(option => option.total === Math.min(...totals))).toBe(true);
        expect(quote.cheapestOptions.length).toBe(totals.filter(total => total === Math.min(...totals)).length);
      }
    }
  });

  it('deriva multiempresa y deja pendiente el control avanzado', () => {
    const quote = calculateCapacityQuote({ users: 5, locations: 1, multiCompany: true, advancedControl: true });
    expect(quote.requiresCustomEvaluation).toBe(true);
    expect(quote.advancedControlPending).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])('rechaza cantidades inválidas: %s', (invalid) => {
    expect(() => calculateCapacityQuote({ users: invalid, locations: 1 })).toThrow(RangeError);
    expect(() => calculateCapacityQuote({ users: 1, locations: invalid })).toThrow(RangeError);
  });
});
