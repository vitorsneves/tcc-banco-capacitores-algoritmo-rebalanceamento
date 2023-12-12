const QNT_COORDENADAS = 4;
const QNT_LIMITES = 2 * QNT_COORDENADAS;

const INDICE_FASE1 = 0;
const INDICE_RAMO1 = 1;
const INDICE_GRUPO1 = 2;
const INDICE_CAPACITOR1 = 3;
const INDICE_FASE2 = 4;
const INDICE_RAMO2 = 5;
const INDICE_GRUPO2 = 6;
const INDICE_CAPACITOR2 = 7;

const permutacoes = ({ QNT_FASES, QNT_RAMOS, QNT_GRUPOS, QNT_PARALELOS }) => {
  const permutador = {
    obterPermutacoesTrifasicas: function () {
      let permutacoes = [];

      for (let fase = 0; fase < QNT_FASES; fase++)
        permutacoes.push(...this.obterPermutacoesMonofasicas(fase));

      for (let fase1 = 0; fase1 < QNT_FASES - 1; fase1++)
        for (let fase2 = fase1 + 1; fase2 < QNT_FASES; fase2++)
          permutacoes.push(...this.obterPermutacoesEntreFases(fase1, fase2));

      return permutacoes;
    },

    obterPermutacoesTrifasicasComPiorFase: function (piorFase) {
      let permutacoes = [];

      permutacoes.push(...this.obterPermutacoesMonofasicas(piorFase));

      for (let fase = 0; fase < QNT_FASES; fase++) {
        if (fase !== piorFase)
          permutacoes.push(...this.obterPermutacoesEntreFases(piorFase, fase));
      }

      return permutacoes;
    },

    obterPermutacoesEntreFases: function (fase1, fase2) {
      let permutacoes = [];

      for (let ramo1 = 0; ramo1 < QNT_RAMOS; ramo1++)
        for (let ramo2 = 0; ramo2 < QNT_RAMOS; ramo2++)
          permutacoes.push(
            ...this.obterPermutacoesEntreRamos(fase1, ramo1, fase2, ramo2)
          );

      return permutacoes;
    },

    obterPermutacoesMonofasicas: function (fase) {
      let permutacoes = [];

      permutacoes.push(...this.obterPermutacoesDentroDosQuatroRamos(fase));

      for (let ramo1 = 0; ramo1 < QNT_RAMOS - 1; ramo1++)
        for (let ramo2 = ramo1 + 1; ramo2 < QNT_RAMOS; ramo2++)
          permutacoes.push(
            ...this.obterPermutacoesEntreRamos(fase, ramo1, fase, ramo2)
          );

      return permutacoes;
    },

    obterPermutacoesDentroDosQuatroRamos: function (fase) {
      let permutacoes = [];

      for (let ramo = 0; ramo < QNT_RAMOS; ramo++) {
        permutacoes.push(...this.obterPermutacoesMesmoRamo(fase, ramo));
      }

      return permutacoes;
    },

    obterPermutacoesEntreRamos: function (fase1, ramo1, fase2, ramo2) {
      const limiteInferior = (indice, valores) => {
        if (indice === INDICE_FASE1) return fase1;
        if (indice === INDICE_FASE2) return fase2;

        if (indice === INDICE_RAMO1) return ramo1;
        if (indice === INDICE_RAMO2) return ramo2;

        return 0;
      };

      const limiteSuperior = (indice) => {
        if (indice === INDICE_FASE1) return fase1 + 1;
        if (indice === INDICE_FASE2) return fase2 + 1;

        if (indice === INDICE_RAMO1) return ramo1 + 1;
        if (indice === INDICE_RAMO2) return ramo2 + 1;

        if (indice === INDICE_GRUPO1 || indice === INDICE_GRUPO2)
          return QNT_GRUPOS;

        if (indice === INDICE_CAPACITOR1 || indice === INDICE_CAPACITOR2)
          return QNT_PARALELOS;
      };

      const limite = {
        inferior: limiteInferior,
        superior: limiteSuperior,
      };

      return obterPermutacoesEntreLimites(limite);
    },

    obterPermutacoesMesmoRamo: function (fase, ramo) {
      const limiteInferior = (indice, valores) => {
        const grupoCapacitor1 = valores[2];

        if (indice === INDICE_FASE1 || indice === INDICE_FASE2) return fase;

        if (indice === INDICE_RAMO1 || indice === INDICE_RAMO2) return ramo;

        if (indice === INDICE_GRUPO2) return grupoCapacitor1 + 1;

        return 0;
      };

      const limiteSuperior = (indice) => {
        if (indice === INDICE_FASE1 || indice === INDICE_FASE2) return fase + 1;

        if (indice === INDICE_RAMO1 || indice === INDICE_RAMO2) return ramo + 1;

        if (indice === INDICE_GRUPO1) return QNT_GRUPOS - 1;

        if (indice === INDICE_GRUPO2) return QNT_GRUPOS;

        if (indice === INDICE_CAPACITOR1 || indice === INDICE_CAPACITOR2)
          return QNT_PARALELOS;
      };

      const limite = {
        inferior: limiteInferior,
        superior: limiteSuperior,
      };

      return obterPermutacoesEntreLimites(limite);
    },
  };

  return permutador;
};

const obterPermutacoesEntreLimites = (limite) => {
  const permutacoes = [];

  const gerarPermutacoes = (limite, indice, valores) => {
    if (indice === QNT_LIMITES) {
      return permutacoes.push([
        [valores[0], valores[1], valores[2], valores[3]],
        [valores[4], valores[5], valores[6], valores[7]],
      ]);
    }

    const comeco = limite.inferior(indice, valores);
    const final = limite.superior(indice);

    for (let ramificacao = comeco; ramificacao < final; ramificacao++) {
      valores[indice] = ramificacao;
      gerarPermutacoes(limite, indice + 1, [...valores]);
    }
  };

  gerarPermutacoes(limite, 0, Array(QNT_LIMITES).fill(0));

  return permutacoes;
};

export default permutacoes;
