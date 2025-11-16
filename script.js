// --- LÓGICA DO DASHBOARD (Widgets) ---
function carregarDashboard() {
    // 1. Encontra os elementos do dashboard
    const dashReais = document.getElementById('dash-economia-reais');
    const dashCO2 = document.getElementById('dash-reducao-co2');
    const dashLixo = document.getElementById('dash-lixo-evitado');
    const dashAgua = document.getElementById('dash-consumo-agua'); // NOVO

    // Se os elementos não existirem na página, pare a função
    // (Agora checa 4 elementos)
    if (!dashReais || !dashCO2 || !dashLixo || !dashAgua) return;

    // 2. Lê os valores do localStorage
    const economiaLampadas = parseFloat(localStorage.getItem('economiaLampadasReais')) || 0;
    const economiaGarrafas = parseFloat(localStorage.getItem('economiaGarrafasReais')) || 0;
    const reducaoCO2 = parseFloat(localStorage.getItem('reducaoLampadasCO2')) || 0;
    const lixoEvitado = parseFloat(localStorage.getItem('lixoGarrafasEvitado')) || 0;
    // NOVO
    const consumoAgua = parseFloat(localStorage.getItem('consumoAguaTotalMensal')) || 0;

    // 3. Soma os totais
    const totalReais = economiaLampadas + economiaGarrafas;
    const totalCO2 = reducaoCO2;
    const totalLixo = lixoEvitado;

    // 4. Exibe os valores no dashboard
    dashReais.textContent = 'R$ ' + totalReais.toFixed(2).replace('.', ',');
    dashCO2.textContent = totalCO2.toFixed(1).replace('.', ',') + ' kg';
    dashLixo.textContent = totalLixo + ' un.';
    // NOVO
    dashAgua.textContent = consumoAgua.toLocaleString('pt-BR') + ' L';
}

// --- LÓGICA DO SIMULADOR (Lâmpadas) ---
function calcularImpacto() {
    // Elementos do simulador
    const lampadasSlider = document.getElementById('lampadas-slider');
    const lampadasValor = document.getElementById('lampadas-valor');
    const economiaEnergia = document.getElementById('economia-energia');
    const economiaReais = document.getElementById('economia-reais');
    const reducaoCO2 = document.getElementById('reducao-co2');

    if (!lampadasSlider) return; // Se não estiver na página, sai

    // Cálculos
    const numLampadas = parseInt(lampadasSlider.value);
    const economiaKWhAno = ( (60 - 9) * numLampadas * 6 * 365 ) / 1000;
    const economiaReaisAno = economiaKWhAno * 0.90;
    const reducaoCO2Ano = economiaKWhAno * 0.0891;

    // Atualiza a tela
    lampadasValor.textContent = numLampadas;
    economiaEnergia.textContent = economiaKWhAno.toFixed(0);
    economiaReais.textContent = 'R$ ' + economiaReaisAno.toFixed(2).replace('.', ',');
    reducaoCO2.textContent = reducaoCO2Ano.toFixed(1).replace('.', ',') + ' kg';

    // Salva no localStorage e atualiza o dashboard
    localStorage.setItem('economiaLampadasReais', economiaReaisAno);
    localStorage.setItem('reducaoLampadasCO2', reducaoCO2Ano);
    carregarDashboard(); 
}

// --- LÓGICA DO COMPARADOR (Garrafas) ---
function calcularImpactoProdutos() {
    // Elementos do comparador
    const garrafasInput = document.getElementById('garrafas-input');
    const precoPetInput = document.getElementById('preco-pet-input');
    const precoReutilInput = document.getElementById('preco-reutil-input');
    const gastoPetEl = document.getElementById('gasto-pet');
    const gastoReutilEl = document.getElementById('gasto-reutil');
    const economiaTotalEl = document.getElementById('economia-total');
    const lixoTotalEl = document.getElementById('lixo-total');

    if (!garrafasInput) return; // Se não estiver na página, sai

    // Pega os valores
    const garrafasPorSemana = parseInt(garrafasInput.value);
    const precoPet = parseFloat(precoPetInput.value);
    const precoReutil = parseFloat(precoReutilInput.value);

    // Cálculos
    const garrafasPorAno = garrafasPorSemana * 52;
    const gastoPetAno = garrafasPorAno * precoPet;
    const economiaAno = gastoPetAno - precoReutil;

    // Atualiza a tela
    if (isNaN(gastoPetAno) || isNaN(precoReutil) || isNaN(economiaAno) || isNaN(garrafasPorAno)) return;
    gastoPetEl.textContent = 'R$ ' + gastoPetAno.toFixed(2).replace('.', ',');
    gastoReutilEl.textContent = 'R$ ' + precoReutil.toFixed(2).replace('.', ',');
    economiaTotalEl.textContent = 'R$ ' + economiaAno.toFixed(2).replace('.', ',');
    lixoTotalEl.textContent = garrafasPorAno;

    // Salva no localStorage e atualiza o dashboard
    localStorage.setItem('economiaGarrafasReais', economiaAno);
    localStorage.setItem('lixoGarrafasEvitado', garrafasPorAno);
    carregarDashboard();
}

// --- LÓGICA DO GRÁFICO DE HISTÓRICO (NOVO) ---
let meuGraficoConsumo; // Variável global para o gráfico

function renderizarGrafico() {
    const ctx = document.getElementById('consumoChart');
    const viewSelect = document.getElementById('chart-view-select');
    if (!ctx) return; // Se não estiver na página do dashboard, não faz nada

    const tipoSelecionado = viewSelect.value;
    const historicoConsumo = JSON.parse(localStorage.getItem('historicoConsumo')) || [];
    const dadosFiltrados = historicoConsumo.filter(item => item.tipo === tipoSelecionado);
    
    const ordemMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    dadosFiltrados.sort((a, b) => ordemMeses.indexOf(a.mes) - ordemMeses.indexOf(b.mes));

    const labels = dadosFiltrados.map(item => item.mes);
    const data = dadosFiltrados.map(item => item.valor);
    const labelGrafico = (tipoSelecionado === 'energia') ? 'Consumo de Energia (kWh)' : 'Consumo de Água (m³)';
    const corGrafico = (tipoSelecionado === 'energia') ? '#FBBF24' : '#3B82F6';

    if (meuGraficoConsumo) {
        meuGraficoConsumo.destroy();
    }

    meuGraficoConsumo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: labelGrafico,
                data: data,
                backgroundColor: corGrafico + '33',
                borderColor: corGrafico,
                borderWidth: 3,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

function salvarCheckin(event) {
    event.preventDefault(); // Impede o recarregamento da página
    
    // Pega os valores de tipo e mês
    const tipo = document.getElementById('checkin-tipo').value;
    const mes = document.getElementById('checkin-mes').value;

    // --- A LÓGICA IMPORTANTE ESTÁ AQUI ---
    // 1. Pega o valor como string (texto)
    const valorString = document.getElementById('checkin-valor').value;

    // 2. Substitui a VÍRGULA (,) por um PONTO (.)
    const valorNormalizado = valorString.replace(',', '.');

    // 3. Converte o valor normalizado para float
    const valor = parseFloat(valorNormalizado);
    // --- FIM DA LÓGICA ---

    // Validação
    if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor numérico válido (ex: 150 ou 150,5).');
        return;
    }

    // Carrega o histórico existente
    const historicoConsumo = JSON.parse(localStorage.getItem('historicoConsumo')) || [];

    // Verifica se já existe um registro
    const indexExistente = historicoConsumo.findIndex(item => item.tipo === tipo && item.mes === mes);

    if (indexExistente > -1) {
        historicoConsumo[indexExistente].valor = valor;
    } else {
        historicoConsumo.push({ tipo, mes, valor });
    }

    // Salva o histórico atualizado
    localStorage.setItem('historicoConsumo', JSON.stringify(historicoConsumo));

    // Limpa o formulário e atualiza o gráfico
    document.getElementById('checkin-valor').value = '';
    document.getElementById('chart-view-select').value = tipo;
    renderizarGrafico();
    
    alert('Registro salvo com sucesso!');
}

// --- LÓGICA DA CALCULADORA DE ÁGUA (NOVO) ---

// Constantes de consumo (em litros). Você pode ajustar esses valores.
const LITROS_MINUTO_BANHO = 12;   // Média de chuveiro
const LITROS_MINUTO_LOUCA = 1.6;  // Torneira moderna (9.6L/min) / 6 (média)
const LITROS_DESCARGA = 9;        // Descarga padrão
const LITROS_MAQUINA_LAVAR = 150; // Média por ciclo

function calcularConsumoAgua() {
    // 1. Pega os sliders
    const banhoSlider = document.getElementById('banho-minutos');
    const loucaSlider = document.getElementById('louca-minutos');
    const descargaSlider = document.getElementById('descarga-vezes');
    const maquinaSlider = document.getElementById('maquina-vezes');

    // Se não estiver na página agua.html, não faz nada
    if (!banhoSlider) return;

    // 2. Pega os spans de valor
    const banhoValor = document.getElementById('banho-valor');
    const loucaValor = document.getElementById('louca-valor');
    const descargaValor = document.getElementById('descarga-valor');
    const maquinaValor = document.getElementById('maquina-valor');
    
    // 3. Pega os spans de resultado
    const resBanho = document.getElementById('res-banho');
    const resLouca = document.getElementById('res-louca');
    const resDescarga = document.getElementById('res-descarga');
    const resMaquina = document.getElementById('res-maquina');
    const resTotal = document.getElementById('res-total');
    const resCaixas = document.getElementById('res-caixas');

    // 4. Pega os valores numéricos dos sliders
    const minutosBanho = parseInt(banhoSlider.value);
    const minutosLouca = parseInt(loucaSlider.value);
    const vezesDescarga = parseInt(descargaSlider.value);
    const vezesMaquina = parseInt(maquinaSlider.value);

    // 5. Atualiza os textos dos sliders (ex: "10 min", "6x")
    banhoValor.textContent = minutosBanho + ' min';
    loucaValor.textContent = minutosLouca + ' min';
    descargaValor.textContent = vezesDescarga + 'x';
    maquinaValor.textContent = vezesMaquina + 'x';

    // 6. Calcula o gasto MENSAL (30 dias)
    const gastoBanho = minutosBanho * LITROS_MINUTO_BANHO * 30;
    const gastoLouca = minutosLouca * LITROS_MINUTO_LOUCA * 30;
    const gastoDescarga = vezesDescarga * LITROS_DESCARGA * 30;
    // Máquina é por SEMANA, então multiplicamos por 4
    const gastoMaquina = (vezesMaquina * LITROS_MAQUINA_LAVAR) * 4; 

    const gastoTotal = gastoBanho + gastoLouca + gastoDescarga + gastoMaquina;

    // 7. Atualiza os resultados na tela
    resBanho.textContent = gastoBanho.toLocaleString('pt-BR') + ' L';
    resLouca.textContent = gastoLouca.toLocaleString('pt-BR') + ' L';
    resDescarga.textContent = gastoDescarga.toLocaleString('pt-BR') + ' L';
    resMaquina.textContent = gastoMaquina.toLocaleString('pt-BR') + ' L';
    
    resTotal.textContent = gastoTotal.toLocaleString('pt-BR') + ' L';
    resCaixas.textContent = (gastoTotal / 500).toFixed(0); // Caixas de 500L
}

// Função para o botão "Salvar no Dashboard"
function salvarConsumoAgua() {
    const resTotal = document.getElementById('res-total');
    if (!resTotal) return;

    // Pega o valor (ex: "10.620 L") e remove o " L" e o "."
    const valorString = resTotal.textContent.replace(' L', '').replace('.', '');
    const valorNumerico = parseFloat(valorString);

    if (isNaN(valorNumerico)) {
        alert('Erro ao salvar. Tente novamente.');
        return;
    }

    // Salva o gasto MENSAL no localStorage
    localStorage.setItem('consumoAguaTotalMensal', valorNumerico);
    
    // Atualiza o dashboard (se estiver em outra página)
    carregarDashboard();
    
    alert('Consumo salvo! Verifique seu dashboard para ver o resumo.');
}

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA GERAL E NAVEGAÇÃO ---
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent.includes('Consulta') || 
            button.textContent.includes('Descobrir mais') || 
            button.textContent.includes('Iniciar conversa')) {
            
            button.addEventListener('click', () => {
                document.getElementById('contato').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }
    });

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('text-foreground');
            link.classList.add('text-muted-foreground');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.remove('text-muted-foreground');
                link.classList.add('text-foreground');
            }
        });
    });

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- LÓGICA DO SIMULADOR DE IMPACTO ---
    const lampadasSlider = document.getElementById('lampadas-slider');
    const lampadasValor = document.getElementById('lampadas-valor');
    const economiaEnergia = document.getElementById('economia-energia');
    const economiaReais = document.getElementById('economia-reais');
    const reducaoCO2 = document.getElementById('reducao-co2');

    function calcularImpacto() {
        if (!lampadasSlider) return;

        const numLampadas = parseInt(lampadasSlider.value);
        const consumoIncandescente = 60;
        const consumoLED = 9;
        const horasPorDia = 6;
        const diasPorAno = 365;
        const precoKWh = 0.90;
        const fatorCO2 = 0.0891;

        const economiaWatts = (consumoIncandescente - consumoLED) * numLampadas;
        const economiaKWhAno = (economiaWatts * horasPorDia * diasPorAno) / 1000;
        const economiaReaisAno = economiaKWhAno * precoKWh;
        const reducaoCO2Ano = economiaKWhAno * fatorCO2;

        lampadasValor.textContent = numLampadas;
        economiaEnergia.textContent = economiaKWhAno.toFixed(0);
        economiaReais.textContent = 'R$ ' + economiaReaisAno.toFixed(2).replace('.', ',');
        reducaoCO2.textContent = reducaoCO2Ano.toFixed(1).replace('.', ',') + ' kg';

        localStorage.setItem('economiaLampadasReais', economiaReaisAno);
        localStorage.setItem('reducaoLampadasCO2', reducaoCO2Ano);
        
        // Atualiza o dashboard em tempo real
        carregarDashboard()
    }

    if (lampadasSlider) {
        lampadasSlider.addEventListener('input', calcularImpacto);
        calcularImpacto();
    }

    // --- LÓGICA DOS DESAFIOS SEMANAIS ---
    const participarBtn = document.getElementById('participar-btn');
    const progressBar = document.getElementById('progress-bar');
    const participantesCount = document.getElementById('participantes-count');
    
    if (participarBtn) {
        let numParticipantes = parseInt(participantesCount.textContent.replace(',', ''));

        participarBtn.addEventListener('click', () => {
            numParticipantes++;
            participantesCount.textContent = numParticipantes.toLocaleString('en-US');
            const novaLargura = Math.min((numParticipantes / 2000) * 100, 100);
            progressBar.style.width = novaLargura + '%';
            participarBtn.textContent = 'Obrigado por participar!';
            participarBtn.disabled = true;
        }, { once: true }); // Adicionado { once: true } para evitar múltiplos cliques
    }

    // --- INICIALIZAÇÃO DE ÍCONES (se estiver usando a biblioteca Lucide) ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- LÓGICA DO COMPARADOR DE PRODUTOS (ODS 12) ---

// 1. Encontra os elementos do HTML
const garrafasInput = document.getElementById('garrafas-input');
const precoPetInput = document.getElementById('preco-pet-input');
const precoReutilInput = document.getElementById('preco-reutil-input');

const gastoPetEl = document.getElementById('gasto-pet');
const gastoReutilEl = document.getElementById('gasto-reutil');
const economiaTotalEl = document.getElementById('economia-total');
const lixoTotalEl = document.getElementById('lixo-total');

// 2. Função que calcula e atualiza a tela
function calcularImpactoProdutos() {
    // Pega os valores dos campos (e converte para número)
    const garrafasPorSemana = parseInt(garrafasInput.value);
    const precoPet = parseFloat(precoPetInput.value);
    const precoReutil = parseFloat(precoReutilInput.value);

    // Calcula
    const garrafasPorAno = garrafasPorSemana * 52;
    const gastoPetAno = garrafasPorAno * precoPet;
    const economiaAno = gastoPetAno - precoReutil;

    // 3. Atualiza os valores no HTML
    // Verifica se os valores são números válidos antes de atualizar
    if (isNaN(gastoPetAno) || isNaN(precoReutil) || isNaN(economiaAno) || isNaN(garrafasPorAno)) {
        return; // Se algo não for um número, não faz nada
    }

    gastoPetEl.textContent = 'R$ ' + gastoPetAno.toFixed(2).replace('.', ',');
    gastoReutilEl.textContent = 'R$ ' + precoReutil.toFixed(2).replace('.', ',');
    economiaTotalEl.textContent = 'R$ ' + economiaAno.toFixed(2).replace('.', ',');
    lixoTotalEl.textContent = garrafasPorAno;

    localStorage.setItem('economiaGarrafasReais', economiaAno);
    localStorage.setItem('lixoGarrafasEvitado', garrafasPorAno);
    
    // Atualiza o dashboard em tempo real
    carregarDashboard();
}

// 4. Adiciona os "escutadores" de eventos
// Chama a função sempre que o usuário mudar qualquer um dos valores
if (garrafasInput && precoPetInput && precoReutilInput) {
    garrafasInput.addEventListener('input', calcularImpactoProdutos);
    precoPetInput.addEventListener('input', calcularImpactoProdutos);
    precoReutilInput.addEventListener('input', calcularImpactoProdutos);

    // Calcula os valores iniciais assim que a página carrega
    calcularImpactoProdutos();
}

const formCheckin = document.getElementById('checkin-form');
    const viewSelect = document.getElementById('chart-view-select');

    // Se estivermos na página do dashboard (elementos existem)
    if (formCheckin && viewSelect) {
        // 2. Adiciona o ouvinte para o envio do formulário
        formCheckin.addEventListener('submit', salvarCheckin);
        
        // 3. Adiciona o ouvinte para a troca de visualização (energia/agua)
        viewSelect.addEventListener('change', renderizarGrafico);
        
        // 4. Renderiza o gráfico pela primeira vez quando a página carrega
        renderizarGrafico();
    }

    // --- LÓGICA DA CALCULADORA DE ÁGUA (NOVO) ---
    const banhoSlider = document.getElementById('banho-minutos');
    const loucaSlider = document.getElementById('louca-minutos');
    const descargaSlider = document.getElementById('descarga-vezes');
    const maquinaSlider = document.getElementById('maquina-vezes');
    const btnSalvarAgua = document.getElementById('salvar-consumo-agua');

    // Checa se estamos na página da calculadora (pelo slider do banho)
    if (banhoSlider) {
        // Adiciona ouvintes para todos os sliders
        banhoSlider.addEventListener('input', calcularConsumoAgua);
        loucaSlider.addEventListener('input', calcularConsumoAgua);
        descargaSlider.addEventListener('input', calcularConsumoAgua);
        maquinaSlider.addEventListener('input', calcularConsumoAgua);
        
        // Ouvinte do botão salvar
        btnSalvarAgua.addEventListener('click', salvarConsumoAgua);
        
        // Roda a função uma vez para carregar os valores iniciais
        calcularConsumoAgua();
    }

carregarDashboard();
});

