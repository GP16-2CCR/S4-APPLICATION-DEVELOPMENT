// ===== Regras de classificação =====
// Faixas contínuas: min é inclusivo e max é exclusivo (não há lacunas entre faixas)
const faixasClassificacao = [
  {
    nivel: 1,
    min: 0,
    max: 11,
    faixaTexto: "De 0 a menos de 11 cm",
    classe: "Monitorado",
    cssClass: "monitorado",
    acao: "Manter monitoramento de rotina.",
    destaque: false,
  },
  {
    nivel: 2,
    min: 11,
    max: 21,
    faixaTexto: "De 11 a menos de 21 cm",
    classe: "Atenção",
    cssClass: "atencao",
    acao: "Agendar inspeção nos próximos 10 dias.",
    destaque: false,
  },
  {
    nivel: 3,
    min: 21,
    max: 30,
    faixaTexto: "De 21 a menos de 30 cm",
    classe: "Intervenção Programada",
    cssClass: "programada",
    acao: "Programar roçagem/corte no prazo máximo de 7 dias.",
    destaque: false,
  },
  {
    nivel: 4,
    min: 30,
    max: Infinity,
    faixaTexto: "30 cm ou mais",
    classe: "Intervenção Prioritária",
    cssClass: "prioritaria",
    acao: "Intervenção imediata: risco à visibilidade e segurança na via.",
    destaque: true,
  },
];

// Array de objetos com os pontos monitorados ao longo da rodovia
const pontosMonitorados = [
  { localizacao: "Km 12 - Rodovia BR-101 (Norte)", altura: 5 },
  { localizacao: "Km 25 - Rodovia BR-101 (Sul)", altura: 15 },
  { localizacao: "Km 40 - Acesso Marginal", altura: 22 },
  { localizacao: "Km 58 - Trevo de Acesso", altura: 26 },
  { localizacao: "Km 73 - Rodovia SP-330", altura: 30 },
  { localizacao: "Km 90 - Ponte Rio Verde", altura: 35 },
];

// ===== Funções de processamento =====

// Retorna a faixa correspondente à altura informada
function classificarVegetacao(altura) {
  const faixa = faixasClassificacao.find(function (f) {
    return altura >= f.min && altura < f.max;
  });

  return (
    faixa || {
      nivel: 0,
      classe: "Não classificado",
      cssClass: "desconhecido",
      acao: "Verificar dado de altura informado.",
      destaque: false,
    }
  );
}

// Aplica a classificação a todos os pontos (usa map)
function analisarPontos(lista) {
  return lista.map(function (ponto) {
    const resultado = classificarVegetacao(ponto.altura);

    return {
      localizacao: ponto.localizacao,
      altura: ponto.altura,
      nivel: resultado.nivel,
      classe: resultado.classe,
      cssClass: resultado.cssClass,
      acao: resultado.acao,
      destaque: resultado.destaque,
    };
  });
}

// Ordena do maior para o menor nível de prioridade; em empate, da maior altura para a menor
function ordenarPorPrioridade(pontos) {
  return [...pontos].sort(function (a, b) {
    return b.nivel - a.nivel || b.altura - a.altura;
  });
}

// Evita injeção de HTML a partir de texto digitado pelo usuário
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// ===== Renderização =====

// Monta a tabela do painel, já ordenada por prioridade
function renderizarDashboard() {
  const tabela = document.getElementById("corpoTabelaMonitoramento");
  tabela.innerHTML = "";

  const pontos = ordenarPorPrioridade(analisarPontos(pontosMonitorados));

  pontos.forEach(function (ponto, indice) {
    const linha = document.createElement("tr");
    linha.classList.add(ponto.cssClass);
    if (ponto.destaque) {
      linha.classList.add("destaque");
    }

    linha.innerHTML = `
      <td>${indice + 1}º</td>
      <td>${escaparHtml(ponto.localizacao)}</td>
      <td>${ponto.altura} cm</td>
      <td><span class="badge ${ponto.cssClass}">${ponto.classe}</span></td>
      <td>${ponto.acao}</td>
    `;

    tabela.appendChild(linha);
  });

  atualizarResumo();
}

// Exibe a contagem por nível no topo do painel
function atualizarResumo() {
  const resumo = document.getElementById("resumoMonitoramento");
  resumo.innerHTML = "";

  const pontos = analisarPontos(pontosMonitorados);

  faixasClassificacao.forEach(function (faixa) {
    const total = pontos.filter(function (p) {
      return p.classe === faixa.classe;
    }).length;

    const card = document.createElement("div");
    card.classList.add("cardResumo", faixa.cssClass);
    card.innerHTML = `
      <h3>${total}</h3>
      <p>${faixa.classe}</p>
    `;
    resumo.appendChild(card);
  });
}

// Exibe a legenda com as regras de classificação
function renderizarLegenda() {
  const legenda = document.getElementById("legendaRegras");
  if (!legenda) return;

  legenda.innerHTML =
    "<ul>" +
    faixasClassificacao
      .map(function (f) {
        return `<li><span class="badge ${f.cssClass}">${f.classe}</span> ${f.faixaTexto}: ${f.acao}</li>`;
      })
      .join("") +
    "</ul>";
}

// ===== Cadastro de novo ponto =====
function cadastrarPontoMonitorado(event) {
  event.preventDefault();

  const localizacaoInput = document.getElementById("localizacaoPonto");
  const alturaInput = document.getElementById("alturaPonto");

  const localizacao = localizacaoInput.value.trim();
  const altura = parseFloat(alturaInput.value);

  if (!localizacao || isNaN(altura) || altura < 0) {
    alert(
      "Por favor, preencha a localização e uma altura válida (número igual ou maior que zero).",
    );
    return;
  }

  pontosMonitorados.push({ localizacao: localizacao, altura: altura });
  renderizarDashboard();

  localizacaoInput.value = "";
  alturaInput.value = "";
}

// ===== Inicialização =====
document.addEventListener("DOMContentLoaded", function () {
  renderizarLegenda();
  renderizarDashboard();

  const formMonitoramento = document.getElementById("formMonitoramento");
  if (formMonitoramento) {
    formMonitoramento.addEventListener("submit", cadastrarPontoMonitorado);
  }
});
