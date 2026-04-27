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

// 🔹 Montar formulário
function montarFormulario() {
  const form = document.getElementById("formulario");

  Object.keys(dados).forEach(categoria => {
    dados[categoria].forEach((item, i) => {
      const div = document.createElement("div");

      div.innerHTML = `<p>${item.pergunta}</p>`;

      item.opcoes.forEach(op => {
        div.innerHTML += `
          <label>
            <input type="radio" name="${categoria}-${i}" value="${op.pontos}">
            ${op.resposta}
          </label><br>
        `;
      });

      form.appendChild(div);
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

// 🔹 Gráfico
function gerarGrafico(total) {
  const ctx = document.getElementById('grafico').getContext('2d');

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sua Pegada'],
      datasets: [{
        label: 'Pontuação',
        data: [total]
      }]
    }
  });
}

// 🔹 Dicas
function gerarDicas(total) {
  let dicas = "";

  if (total <= 5) {
    dicas = "Você já possui hábitos sustentáveis. Continue assim!";
  } else if (total <= 10) {
    dicas = "Tente reduzir o consumo de carne e utilizar mais transporte público.";
  } else {
    dicas = "Considere reduzir consumo, reciclar mais e evitar uso excessivo de carro.";
  }

  let areaDicas = document.getElementById("dicas");

  if (!areaDicas) {
    areaDicas = document.createElement("p");
    areaDicas.id = "dicas";
    document.body.appendChild(areaDicas);
  }

  areaDicas.innerText = dicas;
}
