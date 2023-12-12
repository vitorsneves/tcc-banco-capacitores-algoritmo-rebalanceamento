const CORRENTE_NOMINAL = 358;
const CAPACITANCIA_NOMINAL = 11.33e-6;

const calculaCorrentesDeTodasAsFases = (banco) =>
  banco.map(calculaCorrenteDeUmaFase);

const calculaCorrenteDeUmaFase = (fase) => {
  const [C1, C2, C3, C4] = fase.map(equivalenteRamo);

  let correnteDesbalanco =
    -1 *
    (CORRENTE_NOMINAL / CAPACITANCIA_NOMINAL) *
    (((C4 * C1 - C3 * C2) *
      (C1 * C2 * C4 + C4 * C2 * C3 + C1 * C2 * C3 + C1 * C4 * C3)) /
      ((C1 + C3) * (C2 + C4) * (C2 + C1) * (C4 + C3)));

  return correnteDesbalanco * 1000;
};

const equivalenteRamo = (ramo) =>
  equivalenteParalelo(ramo.map(equivalenteSerie));

const equivalenteParalelo = (capacitancias) =>
  Math.pow(
    capacitancias.reduce((a, b) => a + 1 / b, 0),
    -1
  );

const equivalenteSerie = (capacitancias) =>
  capacitancias.reduce((a, b) => a + b);

export default calculaCorrentesDeTodasAsFases;
