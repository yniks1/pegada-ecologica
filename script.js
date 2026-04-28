let dados;
let grafico;

// 🔹 Carregar JSON
fetch('dados.json')
  .then(res => res.json())
  .then(json => {
    dados = json;
    montarFormulario();
  })
  .catch(error => {
    console.error("Erro ao carregar JSON:", error);
  });

// 🔹 Montar formulário com o visual moderno
function montarFormulario() {
  const form = document.getElementById("formulario");
  form.innerHTML = ""; // Limpa a área antes de gerar as perguntas
  
  // Oculta aquele "Carregando perguntas..." inicial do HTML
  const questionTitleElement = document.getElementById("question");
  if (questionTitleElement) questionTitleElement.style.display = "none";

  let contadorPerguntas = 1;

  Object.keys(dados).forEach(categoria => {
    dados[categoria].forEach((item, i) => {
      // Cria o bloco da pergunta
      const div = document.createElement("div");
      div.style.marginBottom = "3rem"; // Respiro confortável entre as perguntas

      // Título da pergunta
      div.innerHTML = `<h2>${contadorPerguntas}. ${item.pergunta}</h2>`;

      // Cria a grade para os botões (aplica a classe do nosso CSS)
      const optionsGrid = document.createElement("div");
      optionsGrid.classList.add("options-grid");

      item.opcoes.forEach(op => {
        // Cria a label que vai atuar como o nosso "botão bonito"
        const label = document.createElement("label");
        label.classList.add("option-btn");
        
        // Cria o input de rádio, mas esconde a bolinha feia do navegador
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `${categoria}-${i}`;
        input.value = op.pontos;
        input.style.display = "none"; 

        // Adiciona um evento para destacar a opção escolhida com nossa cor Verde
        input.addEventListener('change', function() {
          // Remove o destaque de todas as opções desta pergunta
          const botoesDaPergunta = optionsGrid.querySelectorAll('.option-btn');
          botoesDaPergunta.forEach(b => {
            b.style.borderColor = "#ddd";
            b.style.backgroundColor = "transparent";
          });
          // Aplica o destaque na opção clicada
          label.style.borderColor = "var(--primary-color)";
          label.style.backgroundColor = "rgba(16, 44, 38, 0.05)";
        });

        label.appendChild(input);
        label.appendChild(document.createTextNode(" " + op.resposta));
        optionsGrid.appendChild(label);
      });

      div.appendChild(optionsGrid);
      form.appendChild(div);
      
      contadorPerguntas++;
    });
  });
}

// 🔹 Calcular
function calcular() {
  let total = 0;

  document.querySelectorAll("input:checked").forEach(input => {
    total += parseInt(input.value);
  });

  let resultado = "";

  // Mantida a sua lógica original de pontuação
  if (total <= 5) {
    resultado = "Baixa pegada ecológica 🌱";
  } else if (total <= 10) {
    resultado = "Pegada moderada ⚖️";
  } else {
    resultado = "Alta pegada ecológica ⚠️";
  }

  document.getElementById("resultado").innerText =
    resultado + " (Pontos: " + total + ")";

  localStorage.setItem("resultadoPegada", total);

  gerarGrafico(total);
  gerarDicas(total);
}

// 🔹 Gráfico Atualizado (Visual Minimalista e Funcional)
function gerarGrafico(total) {
  const ctx = document.getElementById('grafico').getContext('2d');

  // Destrói o gráfico antigo se ele existir para evitar erros de renderização
  if (grafico) {
    grafico.destroy();
  }

  // Define um valor de "Média Sustentável Ideal" para comparação.
  // Como adicionamos mais perguntas, uma pontuação "ideal" estaria
  // em torno de 8-10 pontos no total (baixa pontuação em tudo).
  const mediaSustentavel = 8; 

  // Configuração global para garantir que a fonte seja a 'Inter'
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = "#102C26"; // Cor do texto principal

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sua Pegada', 'Média Sustentável Ideal'], // Agora temos duas barras
      datasets: [{
        data: [total, mediaSustentavel],
        // Cores personalizadas para cada barra (padrão array)
        backgroundColor: [
          '#102C26', // Verde Escuro para o usuário
          'rgba(247, 231, 206, 0.6)' // Creme (F7E7CE) transparente para a média
        ],
        borderColor: [
          '#102C26',
          'rgba(16, 44, 38, 0.3)' // Uma borda verde bem suave para a média
        ],
        borderWidth: 1.5,
        borderRadius: 8, // Bordas arredondadas combinando com os botões
        borderSkipped: false, // Arredonda o topo e a base
        barPercentage: 0.6 // Deixa as barras um pouco mais finas e elegantes
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Permite que o CSS controle a altura (400x200 no HTML)
      plugins: {
        legend: {
          display: false // Esconde a legenda (já que temos os labels no eixo X)
        },
        tooltip: {
          // Melhora a aparência do tooltip (o balãozinho ao passar o mouse)
          backgroundColor: '#102C26',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 13 },
          padding: 12,
          cornerRadius: 6,
          displayColors: false, // Esconde o quadradinho de cor no tooltip
          callbacks: {
            label: function(context) {
              return ' Pontuação: ' + context.parsed.y;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false // Removidas as linhas de grade horizontais
          },
          ticks: {
            font: { size: 12 },
            precision: 0 // Apenas números inteiros no eixo Y
          }
        },
        x: {
          grid: {
            display: false // Removidas as linhas de grade verticais
          },
          ticks: {
            font: { size: 13, weight: '500' }
          }
        }
      }
    }
  });
}

// 🔹 Dicas Personalizadas (Abaixo do Gráfico)
function gerarDicas() {
  let dicasPersonalizadas = [];

  // Verifica cada resposta escolhida pelo usuário
  document.querySelectorAll("input:checked").forEach(input => {
    let valor = parseInt(input.value);
    let categoria = input.name.split('-')[0]; // Pega a categoria (alimentacao, moradia, etc)

    // Se a resposta tiver pontuação de impacto médio/alto (>= 3), preparamos uma dica
    if (valor >= 3) {
      // Usamos .some() para não repetir a mesma dica caso a pessoa erre duas de moradia, por exemplo
      if (categoria === "alimentacao" && !dicasPersonalizadas.some(d => d.cat === "alimentacao")) {
        dicasPersonalizadas.push({ cat: "alimentacao", texto: "🍽️ <strong>Alimentação:</strong> Tente incluir mais refeições vegetarianas na semana e evite o excesso de produtos industrializados." });
      }
      if (categoria === "moradia" && !dicasPersonalizadas.some(d => d.cat === "moradia")) {
        dicasPersonalizadas.push({ cat: "moradia", texto: "💡 <strong>Moradia:</strong> Fique de olho no tempo do banho para economizar água e desligue aparelhos da tomada quando não usar." });
      }
      if (categoria === "transporte" && !dicasPersonalizadas.some(d => d.cat === "transporte")) {
        dicasPersonalizadas.push({ cat: "transporte", texto: "🚗 <strong>Transporte:</strong> Que tal experimentar o transporte público, organizar caronas ou andar de bicicleta em trajetos curtos?" });
      }
      if (categoria === "consumo" && !dicasPersonalizadas.some(d => d.cat === "consumo")) {
        dicasPersonalizadas.push({ cat: "consumo", texto: "♻️ <strong>Consumo e Resíduos:</strong> Evite o descarte de óleo na pia (guarde em garrafas para coleta) e separe sempre o lixo reciclável." });
      }
    }
  });

  let areaDicas = document.getElementById("dicas-personalizadas");

  // Se a área de dicas ainda não existir, nós a criamos no HTML
  if (!areaDicas) {
    areaDicas = document.createElement("div");
    areaDicas.id = "dicas-personalizadas";
    
    // Adiciona a caixa de dicas logo após o gráfico (dentro de result-area)
    const resultArea = document.querySelector(".result-area");
    if (resultArea) {
        resultArea.appendChild(areaDicas);
    }
  }

  // Monta o conteúdo visual das dicas
  if (dicasPersonalizadas.length > 0) {
    let listaDicas = dicasPersonalizadas.map(dica => `<li>${dica.texto}</li>`).join("");
    areaDicas.innerHTML = `
        <h3>Dicas para melhorar sua pegada:</h3>
        <ul>${listaDicas}</ul>
    `;
  } else {
    // Se a pessoa tirou pontuação perfeita (tudo abaixo de 3)
    areaDicas.innerHTML = `
        <div class="mensagem-sucesso">
            <h3>Parabéns! 🎉</h3>
            <p>Seus hábitos já são excelentes para o planeta. Continue inspirando outras pessoas!</p>
        </div>
    `;
  }
}
// 🔹 Funções do Modal "Sobre"
function abrirModal(event) {
    if(event) event.preventDefault(); // Evita que a página pule para o topo ao clicar no link
    document.getElementById("modal-sobre").style.display = "block";
}

function fecharModal() {
    document.getElementById("modal-sobre").style.display = "none";
}

// Fecha o modal se o usuário clicar em qualquer lugar fora da caixinha branca
window.onclick = function(event) {
    const modal = document.getElementById("modal-sobre");
    if (event.target == modal) {
        modal.style.display = "none";
    }
}