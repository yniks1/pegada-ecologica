// 🔹 CONFIGURAÇÃO DO SEU FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCLIostKY3CMkpqW0zEeUMugqVSNmNHqaQ",
  authDomain: "pegada-ecologica-25e48.firebaseapp.com",
  projectId: "pegada-ecologica-25e48",
  storageBucket: "pegada-ecologica-25e48.firebasestorage.app",
  messagingSenderId: "175216286594",
  appId: "1:175216286594:web:ed17243408fe3fca92cd9b",
  measurementId: "G-SGTPKVQVFF"
};

// Inicializa o Firebase (Versão Compat)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// 🔹 FUNÇÕES DE LOGIN E LOGOUT
function fazerLogin(event) {
    if (event) event.preventDefault();
    auth.signInWithPopup(provider)
        .then((resultado) => {
            console.log("Login realizado por:", resultado.user.displayName);
        })
        .catch((erro) => {
            console.error("Erro ao fazer login:", erro);
        });
}

function sairDaConta(event) {
    if (event) event.preventDefault();
    auth.signOut();
}

// 🔹 OBSERVADOR DE ESTADO (Monitora se o usuário está logado ou não)
auth.onAuthStateChanged((usuario) => {
    const btnLogin = document.getElementById("btn-login");
    const areaUsuario = document.getElementById("area-usuario");
    const nomeUsuario = document.getElementById("nome-usuario");

    if (usuario) {
        if (btnLogin) btnLogin.style.display = "none";
        if (areaUsuario) areaUsuario.style.display = "inline-block";
        if (nomeUsuario) nomeUsuario.innerText = `Olá, ${usuario.displayName.split(' ')[0]}`; 
    } else {
        if (btnLogin) btnLogin.style.display = "inline-block";
        if (areaUsuario) areaUsuario.style.display = "none";
    }
});

// 🔹 LÓGICA DA CALCULADORA
let dados;
let grafico;

fetch('dados.json')
  .then(res => res.json())
  .then(json => {
    dados = json;
    montarFormulario();
  })
  .catch(error => console.error("Erro ao carregar JSON:", error));

function montarFormulario() {
  const form = document.getElementById("formulario");
  form.innerHTML = ""; 
  
  const questionTitleElement = document.getElementById("question");
  if (questionTitleElement) questionTitleElement.style.display = "none";

  let contadorPerguntas = 1;

  Object.keys(dados).forEach(categoria => {
    dados[categoria].forEach((item, i) => {
      const div = document.createElement("div");
      div.style.marginBottom = "3rem";
      div.innerHTML = `<h2>${contadorPerguntas}. ${item.pergunta}</h2>`;

      const optionsGrid = document.createElement("div");
      optionsGrid.classList.add("options-grid");

      item.opcoes.forEach(op => {
        const label = document.createElement("label");
        label.classList.add("option-btn");
        
        const input = document.createElement("input");
        input.type = "radio";
        input.name = `${categoria}-${i}`;
        input.value = op.pontos;
        input.style.display = "none"; 

        input.addEventListener('change', function() {
          const botoesDaPergunta = optionsGrid.querySelectorAll('.option-btn');
          botoesDaPergunta.forEach(b => {
            b.style.borderColor = "#ddd";
            b.style.backgroundColor = "transparent";
          });
          label.style.borderColor = "var(--primary-color)";
          label.style.backgroundColor = "rgba(16, 44, 38, 0.05)";
          
          // 👇 ATUALIZA A BARRA DE PROGRESSO AO CLICAR 👇
          atualizarProgresso();
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

// 🔹 ATUALIZA A BARRA DE PROGRESSO
function atualizarProgresso() {
  // Conta quantas perguntas existem no total
  const totalPerguntas = document.querySelectorAll('.options-grid').length;
  // Conta quantas perguntas já tiveram uma opção selecionada
  const perguntasRespondidas = document.querySelectorAll("input:checked").length;
  
  // Calcula a porcentagem
  const porcentagem = (perguntasRespondidas / totalPerguntas) * 100;
  
  // Faz a barra crescer visualmente
  const barraProgresso = document.getElementById("barra-progresso");
  if (barraProgresso) {
    barraProgresso.style.width = porcentagem + "%";
  }

  // Atualiza o textinho em cima da barra
  const stepText = document.getElementById("step-text");
  if (stepText) {
    stepText.innerText = `Progresso: ${Math.round(porcentagem)}%`;
  }
}

function calcular() {
  let total = 0;
  document.querySelectorAll("input:checked").forEach(input => {
    total += parseInt(input.value);
  });

  let resultado = "";
  if (total <= 5) { resultado = "Baixa pegada ecológica 🌱"; }
  else if (total <= 10) { resultado = "Pegada moderada ⚖️"; }
  else { resultado = "Alta pegada ecológica ⚠️"; }

  document.getElementById("resultado").innerText = resultado + " (Pontos: " + total + ")";
  localStorage.setItem("resultadoPegada", total);

  gerarGrafico(total);
  gerarDicas();
}

function gerarGrafico(total) {
  const ctx = document.getElementById('grafico').getContext('2d');
  if (grafico) { grafico.destroy(); }

  const mediaSustentavel = 8; 
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = "#102C26";

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sua Pegada', 'Média Sustentável Ideal'],
      datasets: [{
        data: [total, mediaSustentavel],
        backgroundColor: ['#102C26', 'rgba(247, 231, 206, 0.6)'],
        borderColor: ['#102C26', 'rgba(16, 44, 38, 0.3)'],
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { display: false } },
        x: { grid: { display: false } }
      }
    }
  });
}

function gerarDicas() {
  let dicasPersonalizadas = [];
  document.querySelectorAll("input:checked").forEach(input => {
    let valor = parseInt(input.value);
    let categoria = input.name.split('-')[0];

    if (valor >= 3) {
      if (categoria === "alimentacao" && !dicasPersonalizadas.some(d => d.cat === "alimentacao")) {
        dicasPersonalizadas.push({ cat: "alimentacao", texto: "🍽️ <strong>Alimentação:</strong> Tente incluir mais refeições vegetarianas na semana." });
      }
      if (categoria === "moradia" && !dicasPersonalizadas.some(d => d.cat === "moradia")) {
        dicasPersonalizadas.push({ cat: "moradia", texto: "💡 <strong>Moradia:</strong> Reduza o tempo do banho e desligue aparelhos em stand-by." });
      }
      if (categoria === "transporte" && !dicasPersonalizadas.some(d => d.cat === "transporte")) {
        dicasPersonalizadas.push({ cat: "transporte", texto: "🚗 <strong>Transporte:</strong> Experimente usar transporte público ou caronas." });
      }
      if (categoria === "consumo" && !dicasPersonalizadas.some(d => d.cat === "consumo")) {
        dicasPersonalizadas.push({ cat: "consumo", texto: "♻️ <strong>Consumo:</strong> Recicle o óleo de cozinha e separe o lixo corretamente." });
      }
    }
  });

  let areaDicas = document.getElementById("dicas-personalizadas");
  if (!areaDicas) {
    areaDicas = document.createElement("div");
    areaDicas.id = "dicas-personalizadas";
    const resultArea = document.querySelector(".result-area");
    if (resultArea) resultArea.appendChild(areaDicas);
  }

  if (dicasPersonalizadas.length > 0) {
    let listaDicas = dicasPersonalizadas.map(dica => `<li>${dica.texto}</li>`).join("");
    areaDicas.innerHTML = `<h3>Dicas para melhorar sua pegada:</h3><ul>${listaDicas}</ul>`;
  } else {
    areaDicas.innerHTML = `<div class="mensagem-sucesso"><h3>Parabéns! 🎉</h3><p>Seus hábitos são excelentes!</p></div>`;
  }
}

// 🔹 MODAL E UTILITÁRIOS
function abrirModal(event) {
    if(event) event.preventDefault();
    document.getElementById("modal-sobre").style.display = "block";
}

function fecharModal() {
    document.getElementById("modal-sobre").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("modal-sobre");
    if (event.target == modal) { modal.style.display = "none"; }
}