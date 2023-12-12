const QNT_RAMOS = 4;
const QNT_GRUPOS = 5;
const QNT_PARALELOS = 2;

const correnteNominal = 358;
const capacitanciaNominal = 11.33e-6;

const balanceamento = (tipo, fase) => {
  let permutacoes = [];

  if (tipo === "monofasico") {
    permutacoes.push(...obterPermutacoesMesmoRamo(fase));
    permutacoes.push(...obterPermutacoesMonofasicasEntreRamos(fase));
  }

  const balanceador = (pontes) => {
    let pontesAtuais = JSON.parse(JSON.stringify(pontes));
    let correntesAtuais = calculaAsTresCorrentes(pontesAtuais);
    let variacaoPercentualAtual = [0, 0, 0];
    let cooredenadasAtuais = null;

    if (tipo === "trifasico") {
      const moduloCorrentes = correntesAtuais.map((corrente) =>
        Math.abs(corrente)
      );
      const maiorCorrente = Math.max(...moduloCorrentes);
      const piorFase = moduloCorrentes.indexOf(maiorCorrente);

      const melhoresFases = [0, 1, 2].filter(
        (indiceFase) => indiceFase !== piorFase
      );

      permutacoes = [];

      permutacoes.push(...obterPermutacoesMesmoRamo(piorFase));
      permutacoes.push(...obterPermutacoesMonofasicasEntreRamos(piorFase));
      permutacoes.push(
        ...obterPermutacoesEntreFases(piorFase, melhoresFases[0])
      );
      permutacoes.push(
        ...obterPermutacoesEntreFases(piorFase, melhoresFases[1])
      );
    }

    const testarPermutacao = (coordenadas) => {
      let pontesNovas = trocarCapacitores(pontes, coordenadas);
      let correntesNovas = calculaAsTresCorrentes(pontesNovas);

      const variacaoPercentualNova = calcularVariacaoPercentual(
        correntesAtuais,
        correntesNovas
      );

      if (
        configuracaoEhMelhor(variacaoPercentualAtual, variacaoPercentualNova)
      ) {
        pontesAtuais = pontesNovas;
        correntesAtuais = correntesNovas;
        cooredenadasAtuais = coordenadas;
        variacaoPercentualAtual = variacaoPercentualNova;
      }
    };

    permutacoes.forEach(testarPermutacao);

    return {
      pontes: pontesAtuais,
      coordenadas: cooredenadasAtuais,
      correntes: correntesAtuais,
    };
  };

  return balanceador;
};

const configuracaoEhMelhor = (
  variacaoPercentualAtual,
  variacaoPercentualNova
) => {
  const totalAtual = variacaoPercentualAtual.reduce((a, b) => a + b);
  const totalNova = variacaoPercentualNova.reduce((a, b) => a + b);

  return totalNova < totalAtual;
};

const calcularVariacaoPercentual = (correntesAtuais, correntesNovas) => {
  return correntesAtuais.map(
    (corrente, indice) =>
      ((Math.abs(correntesNovas[indice]) - Math.abs(corrente)) /
        Math.abs(corrente)) *
      100
  );
};

const obterPermutacoesMesmoRamo = (fase) => {
  const permutacoes = [];

  for (let ramo = 0; ramo < QNT_RAMOS; ramo++)
    for (let grupoCapa0 = 0; grupoCapa0 < QNT_GRUPOS - 1; grupoCapa0++)
      for (let posicaoCapa0 = 0; posicaoCapa0 < QNT_PARALELOS; posicaoCapa0++)
        for (
          let grupoCapa1 = grupoCapa0 + 1;
          grupoCapa1 < QNT_GRUPOS;
          grupoCapa1++
        )
          for (
            let posicaoCapa1 = 0;
            posicaoCapa1 < QNT_PARALELOS;
            posicaoCapa1++
          )
            permutacoes.push([
              [fase, ramo, grupoCapa0, posicaoCapa0],
              [fase, ramo, grupoCapa1, posicaoCapa1],
            ]);

  return permutacoes;
};

const obterPermutacoesMonofasicasEntreRamos = (fase) => {
  const permutacoes = [];

  for (let ramoCapa0 = 0; ramoCapa0 < QNT_RAMOS - 1; ramoCapa0++)
    for (let grupoCapa0 = 0; grupoCapa0 < QNT_GRUPOS; grupoCapa0++)
      for (let posicaoCapa0 = 0; posicaoCapa0 < QNT_PARALELOS; posicaoCapa0++)
        for (let ramoCapa1 = ramoCapa0 + 1; ramoCapa1 < QNT_RAMOS; ramoCapa1++)
          for (let grupoCapa1 = 0; grupoCapa1 < QNT_GRUPOS; grupoCapa1++)
            for (
              let posicaoCapa1 = 0;
              posicaoCapa1 < QNT_PARALELOS;
              posicaoCapa1++
            )
              permutacoes.push([
                [fase, ramoCapa0, grupoCapa0, posicaoCapa0],
                [fase, ramoCapa1, grupoCapa1, posicaoCapa1],
              ]);

  return permutacoes;
};

const obterPermutacoesEntreFases = (primeiraFase, segundaFase) => {
  const permutacoes = [];

  for (let ramoCapa0 = 0; ramoCapa0 < QNT_RAMOS; ramoCapa0++)
    for (let grupoCapa0 = 0; grupoCapa0 < QNT_GRUPOS; grupoCapa0++)
      for (let posicaoCapa0 = 0; posicaoCapa0 < QNT_PARALELOS; posicaoCapa0++)
        for (let ramoCapa1 = 0; ramoCapa1 < QNT_RAMOS; ramoCapa1++)
          for (let grupoCapa1 = 0; grupoCapa1 < QNT_GRUPOS; grupoCapa1++)
            for (
              let posicaoCapa1 = 0;
              posicaoCapa1 < QNT_PARALELOS;
              posicaoCapa1++
            )
              permutacoes.push([
                [primeiraFase, ramoCapa0, grupoCapa0, posicaoCapa0],
                [segundaFase, ramoCapa1, grupoCapa1, posicaoCapa1],
              ]);

  return permutacoes;
};

const trocarCapacitores = (pontes, coord) => {
  let pontesNovas = JSON.parse(JSON.stringify(pontes));

  pontesNovas[coord[0][0]][coord[0][1]][coord[0][2]][coord[0][3]] =
    pontes[coord[1][0]][coord[1][1]][coord[1][2]][coord[1][3]];

  pontesNovas[coord[1][0]][coord[1][1]][coord[1][2]][coord[1][3]] =
    pontes[coord[0][0]][coord[0][1]][coord[0][2]][coord[0][3]];

  return pontesNovas;
};

const calculaAsTresCorrentes = (pontes) => {
  return [
    calculaCorrente(pontes[0]),
    calculaCorrente(pontes[1]),
    calculaCorrente(pontes[2]),
  ];
};

// Resultado em mA
const calculaCorrente = (ponteH) => {
  const a = ponteH[0][0][0] + ponteH[0][0][1];
  const b = ponteH[0][1][0] + ponteH[0][1][1];
  const c = ponteH[0][2][0] + ponteH[0][2][1];
  const d = ponteH[0][3][0] + ponteH[0][3][1];
  const e = ponteH[0][4][0] + ponteH[0][4][1];

  const f =
    1 / (ponteH[0][0][0] + ponteH[0][0][1]) +
    1 / (ponteH[0][1][0] + ponteH[0][1][1]) +
    1 / (ponteH[0][2][0] + ponteH[0][2][1]) +
    1 / (ponteH[0][3][0] + ponteH[0][3][1]) +
    1 / (ponteH[0][4][0] + ponteH[0][4][1]);

  let C1 = Math.pow(
    1 / (ponteH[0][0][0] + ponteH[0][0][1]) +
      1 / (ponteH[0][1][0] + ponteH[0][1][1]) +
      1 / (ponteH[0][2][0] + ponteH[0][2][1]) +
      1 / (ponteH[0][3][0] + ponteH[0][3][1]) +
      1 / (ponteH[0][4][0] + ponteH[0][4][1]),
    -1
  );
  let C2 = Math.pow(
    1 / (ponteH[1][0][0] + ponteH[1][0][1]) +
      1 / (ponteH[1][1][0] + ponteH[1][1][1]) +
      1 / (ponteH[1][2][0] + ponteH[1][2][1]) +
      1 / (ponteH[1][3][0] + ponteH[1][3][1]) +
      1 / (ponteH[1][4][0] + ponteH[1][4][1]),
    -1
  );
  let C3 = Math.pow(
    1 / (ponteH[2][0][0] + ponteH[2][0][1]) +
      1 / (ponteH[2][1][0] + ponteH[2][1][1]) +
      1 / (ponteH[2][2][0] + ponteH[2][2][1]) +
      1 / (ponteH[2][3][0] + ponteH[2][3][1]) +
      1 / (ponteH[2][4][0] + ponteH[2][4][1]),
    -1
  );
  let C4 = Math.pow(
    1 / (ponteH[3][0][0] + ponteH[3][0][1]) +
      1 / (ponteH[3][1][0] + ponteH[3][1][1]) +
      1 / (ponteH[3][2][0] + ponteH[3][2][1]) +
      1 / (ponteH[3][3][0] + ponteH[3][3][1]) +
      1 / (ponteH[3][4][0] + ponteH[3][4][1]),
    -1
  );

  let correnteDesbalanco =
    (correnteNominal / capacitanciaNominal) *
    (((C4 * C1 - C3 * C2) *
      (C1 * C2 * C4 + C4 * C2 * C3 + C1 * C2 * C3 + C1 * C4 * C3)) /
      ((C1 + C3) * (C2 + C4) * (C2 + C1) * (C4 + C3)));

  return correnteDesbalanco * 1000;
};

export default balanceamento;
