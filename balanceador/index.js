import permutacoes from "./permutacoes.js";
import calculaCorrentesDeTodasAsFases from "./calculadoraDoBanco.js";

const QNT_FASES = 3;
const QNT_RAMOS = 4;
const QNT_GRUPOS = 5;
const QNT_PARALELOS = 2;

const permutador = permutacoes({
  QNT_FASES,
  QNT_RAMOS,
  QNT_GRUPOS,
  QNT_PARALELOS,
});

const balanceador = (banco, tipo, ehRapido, fase) => {
  let bancoAtual = JSON.parse(JSON.stringify(banco));
  let correntesIniciais = calculaCorrentesDeTodasAsFases(bancoAtual);
  let correntesAtuais = correntesIniciais;
  let coordenadasAtuais = null;

  const testarPermutacao = (coordenadas) => {
    let bancoNovo = trocarCapacitores(banco, coordenadas);
    let correntesNovas = calculaCorrentesDeTodasAsFases(bancoNovo);

    if (
      configuracaoEhMelhor(correntesAtuais, correntesNovas, correntesIniciais)
    ) {
      bancoAtual = bancoNovo;
      correntesAtuais = correntesNovas;
      coordenadasAtuais = coordenadas;
    }
  };

  const obterPermutacoes = () => {
    let permutacoes = [];

    if (tipo === "monofasico") {
      permutacoes = permutador.obterPermutacoesMonofasicas(fase);
    }

    if (tipo === "trifasicoComPiorFase") {
      const piorFase = obterPiorFase(banco);
      permutacoes = permutador.obterPermutacoesTrifasicasComPiorFase(piorFase);
    }

    if (tipo === "trifasico") {
      permutacoes = permutador.obterPermutacoesTrifasicas();
    }

    if (ehRapido) return filtarPermutacoesLentas(permutacoes);

    return permutacoes;
  };

  const permutacoes = obterPermutacoes();
  permutacoes.forEach(testarPermutacao);

  const variacaoPercentualAtual = calcularVariacaoPercentual(
    correntesIniciais,
    correntesAtuais
  );

  console.log(variacaoPercentualAtual);

  return {
    banco: bancoAtual,
    coordenadas: coordenadasAtuais,
    correntes: correntesAtuais,
  };
};

const filtarPermutacoesLentas = (permutacoes) =>
  permutacoes.filter((permutacao) =>
    permutacao.map(ehDoHackInferior).every((o) => o)
  );

const ehDoHackInferior = ([, ramo, grupo]) =>
  (ramo === 2 || ramo === 3) && grupo !== 0;

const obterPiorFase = (banco) => {
  const correntes = calculaCorrentesDeTodasAsFases(banco);
  const moduloCorrentes = correntes.map((corrente) => Math.abs(corrente));
  const maiorCorrente = Math.max(...moduloCorrentes);
  const piorFase = moduloCorrentes.indexOf(maiorCorrente);

  return piorFase;
};

const configuracaoEhMelhor = (
  correntesAtuais,
  correntesNovas,
  correntesIniciais
) => {
  const variacaoPercentualAtual = calcularVariacaoPercentual(
    correntesIniciais,
    correntesAtuais
  );

  const variacaoPercentualNova = calcularVariacaoPercentual(
    correntesIniciais,
    correntesNovas
  );

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

const trocarCapacitores = (pontes, coord) => {
  let pontesNovas = JSON.parse(JSON.stringify(pontes));

  pontesNovas[coord[0][0]][coord[0][1]][coord[0][2]][coord[0][3]] =
    pontes[coord[1][0]][coord[1][1]][coord[1][2]][coord[1][3]];

  pontesNovas[coord[1][0]][coord[1][1]][coord[1][2]][coord[1][3]] =
    pontes[coord[0][0]][coord[0][1]][coord[0][2]][coord[0][3]];

  return pontesNovas;
};

export default balanceador;
