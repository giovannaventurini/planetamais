
// --- Variáveis Globais dos Gráficos ---
let meuGraficoOrigem; 
let meuGraficoConsumo;

// --- Constantes da Calculadora de Água ---
const LITROS_MINUTO_BANHO = 12;   // Média de chuveiro elétrico (Fonte: Sabesp)
const LITROS_MINUTO_LOUCA = 14;   // Torneira de cozinha aberta 1/2 volta a total (Fonte: Sabesp/Abrafac)
const LITROS_DESCARGA = 9;        // Média entre válvulas antigas (12L+) e caixas acopladas (6L)
const LITROS_MAQUINA_LAVAR = 135; // Média por ciclo de máquina de 10kg (Fonte: Sabesp/Fabricantes)

// --- LÓGICA DO DASHBOARD (Widgets e Gráfico de Pizza) ---

function carregarDashboard() {
    // 1. Encontra os elementos dos widgets
    const dashReais = document.getElementById('dash-economia-reais');
    const dashCO2 = document.getElementById('dash-reducao-co2');
    const dashLixo = document.getElementById('dash-lixo-evitado');
    const dashAgua = document.getElementById('dash-consumo-agua');
    
    if (!dashReais) return; // Se não estiver no dashboard, não faz nada

    // 2. Lê TODOS os valores do localStorage
    const economiaLampadas = parseFloat(localStorage.getItem('economiaLampadasReais')) || 0;
    const economiaGarrafas = parseFloat(localStorage.getItem('economiaGarrafasReais')) || 0;
    const reducaoCO2Lampadas = parseFloat(localStorage.getItem('reducaoLampadasCO2')) || 0;
    const reducaoCO2Garrafas = parseFloat(localStorage.getItem('reducaoGarrafasCO2')) || 0; 
    const lixoEvitado = parseFloat(localStorage.getItem('lixoGarrafasEvitado')) || 0;
    const consumoAgua = parseFloat(localStorage.getItem('consumoAguaTotalMensal')) || 0;

    // 3. Soma os totais para os widgets
    const totalReais = economiaLampadas + economiaGarrafas;
    const totalCO2 = reducaoCO2Lampadas + reducaoCO2Garrafas; 
    const totalLixo = lixoEvitado;

    // 4. Exibe os valores nos widgets
    dashReais.textContent = 'R$ ' + totalReais.toFixed(2).replace('.', ',');
    dashCO2.textContent = totalCO2.toFixed(1).replace('.', ',') + ' kg'; 
    dashLixo.textContent = totalLixo + ' un.';
    dashAgua.textContent = consumoAgua.toLocaleString('pt-BR') + ' L';

    // 5. LÓGICA DO GRÁFICO DE PIZZA
    const ctxOrigem = document.getElementById('origemChart');
    if (ctxOrigem) { // Só executa se o gráfico de pizza existir
        const dataOrigem = {
            labels: ['Economia de Lâmpadas (CO₂)', 'Redução de Plástico (CO₂)'],
            datasets: [{
                label: 'Origem do Impacto (kg CO₂)',
                data: [reducaoCO2Lampadas.toFixed(1), reducaoCO2Garrafas.toFixed(1)],
                backgroundColor: ['#FBBF24', '#3B82F6'],
                hoverOffset: 4
            }]
        };
        if (meuGraficoOrigem) {
            meuGraficoOrigem.destroy();
        }
        meuGraficoOrigem = new Chart(ctxOrigem, {
            type: 'doughnut',
            data: dataOrigem,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
            }
        });
    }

    // 6. --- LÓGICA DAS METAS PESSOAIS (NOVO) ---
    const metaTexto = document.getElementById('meta-texto');
    const metaBarra = document.getElementById('meta-progress-bar');
    const metaTipoSelect = document.getElementById('meta-tipo');
    
    if (metaTexto) { // Só executa se os elementos da meta existirem
        // Lê a meta guardada
        const metaTipo = localStorage.getItem('metaTipo') || 'nenhuma';
        const metaValor = parseFloat(localStorage.getItem('metaValor')) || 0;
        
        let progressoAtual = 0;
        let progressoPercent = 0;
        let textoMeta = 'Defina um objetivo para começar!';
        let unidade = '';

        // Calcula o progresso com base no tipo de meta
        if (metaTipo === 'co2') {
            progressoAtual = totalCO2;
            unidade = 'kg de CO₂';
        } else if (metaTipo === 'reais') {
            progressoAtual = totalReais;
            unidade = 'R$';
        } else if (metaTipo === 'lixo') {
            progressoAtual = totalLixo;
            unidade = 'un. de lixo';
        }
        
        // Atualiza os elementos
        if (metaTipo !== 'nenhuma' && metaValor > 0) {
            // Calcula a percentagem, com um limite de 100%
            progressoPercent = Math.min((progressoAtual / metaValor) * 100, 100);
            
            // Define o texto
            textoMeta = `Meta: Atingir ${metaValor.toLocaleString('pt-BR')} ${unidade}.`;
            textoMeta += ` (Progresso: ${progressoAtual.toLocaleString('pt-BR')} ${unidade})`;
            
            // Atualiza o <select> para mostrar a meta atual
            metaTipoSelect.value = metaTipo;
        }

        // Define a largura da barra de progresso e o texto
        metaBarra.style.width = progressoPercent + '%';
        metaTexto.textContent = textoMeta;
    }
}

// --- LÓGICA DO SIMULADOR (Lâmpadas) ---
// --- LÓGICA DO SIMULADOR (Lâmpadas) ---
function calcularImpacto() {
    const lampadasSlider = document.getElementById('lampadas-slider');
    const lampadasValor = document.getElementById('lampadas-valor');
    const economiaEnergia = document.getElementById('economia-energia');
    const economiaReais = document.getElementById('economia-reais');
    const reducaoCO2 = document.getElementById('reducao-co2');

    if (!lampadasSlider) return; 

    const numLampadas = parseInt(lampadasSlider.value);
    // Cálculo mantido: (60W incandescente - 9W LED) * qtd * horas * dias / 1000
    const economiaKWhAno = ( (60 - 9) * numLampadas * 6 * 365 ) / 1000;
    
    // Custo médio mantido (R$ 0,90 é realista para SP/MG com bandeiras)
    const economiaReaisAno = economiaKWhAno * 0.90;

    // CORREÇÃO: Fator de emissão do SIN (Sistema Interligado Nacional) para 2025 (MCTI)
    // Valor oficial: 0,0289 kg CO2 por kWh
    const reducaoCO2Ano = economiaKWhAno * 0.0289; 

    lampadasValor.textContent = numLampadas;
    economiaEnergia.textContent = economiaKWhAno.toFixed(0);
    economiaReais.textContent = 'R$ ' + economiaReaisAno.toFixed(2).replace('.', ',');
    reducaoCO2.textContent = reducaoCO2Ano.toFixed(1).replace('.', ',') + ' kg';

    localStorage.setItem('economiaLampadasReais', economiaReaisAno);
    localStorage.setItem('reducaoLampadasCO2', reducaoCO2Ano);
    carregarDashboard(); 
}

// --- LÓGICA DO COMPARADOR (Garrafas) ---
// --- LÓGICA DO COMPARADOR (Garrafas) ---
function calcularImpactoProdutos() {
    const garrafasInput = document.getElementById('garrafas-input');
    // ... (restante das declarações de variáveis continua igual) ...
    const lixoTotalEl = document.getElementById('lixo-total');

    if (!garrafasInput) return;

    const garrafasPorSemana = parseInt(garrafasInput.value);
    const precoPet = parseFloat(precoPetInput.value);
    const precoReutil = parseFloat(precoReutilInput.value);

    const garrafasPorAno = garrafasPorSemana * 52;
    const gastoPetAno = garrafasPorAno * precoPet;
    const economiaAno = gastoPetAno - precoReutil;
    
    // Pegada de carbono estimada para produção de 1 garrafa PET de 500ml
    // Valor médio de estudos de Ciclo de Vida (ACV): ~0,150 kg (150g) de CO2 por garrafa
    const CO2_POR_GARRAFA = 0.150; 
    const reducaoCO2 = garrafasPorAno * CO2_POR_GARRAFA;

    if (isNaN(gastoPetAno) || isNaN(precoReutil) || isNaN(economiaAno) || isNaN(garrafasPorAno)) return;
    
    gastoPetEl.textContent = 'R$ ' + gastoPetAno.toFixed(2).replace('.', ',');
    gastoReutilEl.textContent = 'R$ ' + precoReutil.toFixed(2).replace('.', ',');
    economiaTotalEl.textContent = 'R$ ' + economiaAno.toFixed(2).replace('.', ',');
    lixoTotalEl.textContent = garrafasPorAno;

    // Salva TUDO no localStorage
    localStorage.setItem('economiaGarrafasReais', economiaAno);
    localStorage.setItem('lixoGarrafasEvitado', garrafasPorAno);
    localStorage.setItem('reducaoGarrafasCO2', reducaoCO2); // A linha que faltava
    
    carregarDashboard();
}

// --- LÓGICA DO GRÁFICO DE HISTÓRICO (Check-in) ---
function renderizarGrafico() {
    const ctx = document.getElementById('consumoChart');
    const viewSelect = document.getElementById('chart-view-select');
    if (!ctx) return; 

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
    event.preventDefault(); 
    const tipo = document.getElementById('checkin-tipo').value;
    const mes = document.getElementById('checkin-mes').value;

    const valorString = document.getElementById('checkin-valor').value;
    const valorNormalizado = valorString.replace(',', '.');
    const valor = parseFloat(valorNormalizado);

    if (isNaN(valor) || valor <= 0) {
        alert('Por favor, insira um valor numérico válido (ex: 150 ou 150,5).');
        return;
    }

    const historicoConsumo = JSON.parse(localStorage.getItem('historicoConsumo')) || [];
    const indexExistente = historicoConsumo.findIndex(item => item.tipo === tipo && item.mes === mes);

    if (indexExistente > -1) {
        historicoConsumo[indexExistente].valor = valor;
    } else {
        historicoConsumo.push({ tipo, mes, valor });
    }

    localStorage.setItem('historicoConsumo', JSON.stringify(historicoConsumo));
    document.getElementById('checkin-valor').value = '';
    document.getElementById('chart-view-select').value = tipo;
    renderizarGrafico();
    alert('Registro salvo com sucesso!');
}

// --- LÓGICA DA CALCULADORA DE ÁGUA ---
function calcularConsumoAgua() {
    const banhoSlider = document.getElementById('banho-minutos');
    if (!banhoSlider) return;

    const loucaSlider = document.getElementById('louca-minutos');
    const descargaSlider = document.getElementById('descarga-vezes');
    const maquinaSlider = document.getElementById('maquina-vezes');
    const banhoValor = document.getElementById('banho-valor');
    const loucaValor = document.getElementById('louca-valor');
    const descargaValor = document.getElementById('descarga-valor');
    const maquinaValor = document.getElementById('maquina-valor');
    const resBanho = document.getElementById('res-banho');
    const resLouca = document.getElementById('res-louca');
    const resDescarga = document.getElementById('res-descarga');
    const resMaquina = document.getElementById('res-maquina');
    const resTotal = document.getElementById('res-total');
    const resCaixas = document.getElementById('res-caixas');

    const minutosBanho = parseInt(banhoSlider.value);
    const minutosLouca = parseInt(loucaSlider.value);
    const vezesDescarga = parseInt(descargaSlider.value);
    const vezesMaquina = parseInt(maquinaSlider.value);

    banhoValor.textContent = minutosBanho + ' min';
    loucaValor.textContent = minutosLouca + ' min';
    descargaValor.textContent = vezesDescarga + 'x';
    maquinaValor.textContent = vezesMaquina + 'x';

    const gastoBanho = minutosBanho * LITROS_MINUTO_BANHO * 30;
    const gastoLouca = minutosLouca * LITROS_MINUTO_LOUCA * 30;
    const gastoDescarga = vezesDescarga * LITROS_DESCARGA * 30;
    const gastoMaquina = (vezesMaquina * LITROS_MAQUINA_LAVAR) * 4; 
    const gastoTotal = gastoBanho + gastoLouca + gastoDescarga + gastoMaquina;

    resBanho.textContent = gastoBanho.toLocaleString('pt-BR') + ' L';
    resLouca.textContent = gastoLouca.toLocaleString('pt-BR') + ' L';
    resDescarga.textContent = gastoDescarga.toLocaleString('pt-BR') + ' L';
    resMaquina.textContent = gastoMaquina.toLocaleString('pt-BR') + ' L';
    resTotal.textContent = gastoTotal.toLocaleString('pt-BR') + ' L';
    resCaixas.textContent = (gastoTotal / 500).toFixed(0);
}

function salvarConsumoAgua() {
    const resTotal = document.getElementById('res-total');
    if (!resTotal) return;

    const valorString = resTotal.textContent.replace(' L', '').replace('.', '');
    const valorNumerico = parseFloat(valorString);

    if (isNaN(valorNumerico)) {
        alert('Erro ao salvar. Tente novamente.');
        return;
    }

    localStorage.setItem('consumoAguaTotalMensal', valorNumerico);
    carregarDashboard();
    alert('Consumo salvo! Verifique seu dashboard para ver o resumo.');
}

function salvarMeta(event) {
    event.preventDefault();
    
    const tipo = document.getElementById('meta-tipo').value;
    
    // Pega o valor, normaliza vírgula para ponto
    const valorString = document.getElementById('meta-valor').value;
    const valorNormalizado = valorString.replace(',', '.');
    let valor = parseFloat(valorNormalizado);

    // Se o tipo for "nenhuma" ou o valor for inválido, limpa a meta
    if (tipo === 'nenhuma' || isNaN(valor) || valor <= 0) {
        localStorage.removeItem('metaTipo');
        localStorage.removeItem('metaValor');
    } else {
        // Salva a meta
        localStorage.setItem('metaTipo', tipo);
        localStorage.setItem('metaValor', valor);
    }
    
    // Limpa o campo de valor
    document.getElementById('meta-valor').value = '';
    
    // Atualiza imediatamente o dashboard para mostrar a nova meta
    carregarDashboard();
    
    alert('Meta atualizada com sucesso!');
}

document.addEventListener('DOMContentLoaded', function() {
    
    // --- LÓGICA GERAL E NAVEGAÇÃO ---
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent.includes('Consulta') || 
            button.textContent.includes('Descobrir mais') || 
            button.textContent.includes('Iniciar conversa')) {
            
            button.addEventListener('click', () => {
                const contatoSection = document.getElementById('contato');
                if (contatoSection) {
                    contatoSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    });

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    if (sections.length > 0 && navLinks.length > 0) {
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
                if (link.href && link.href.includes('#' + current)) {
                    link.classList.remove('text-muted-foreground');
                    link.classList.add('text-foreground');
                }
            });
        });
    }

    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // --- LÓGICA DO SIMULADOR (Lâmpadas) ---
    const lampadasSlider = document.getElementById('lampadas-slider');
    if (lampadasSlider) {
        lampadasSlider.addEventListener('input', calcularImpacto);
        calcularImpacto(); // Roda na primeira vez
    }

    // --- LÓGICA DOS DESAFIOS SEMANAIS ---
    const participarBtn = document.getElementById('participar-btn');
    const progressBar = document.getElementById('progress-bar');
    const participantesCount = document.getElementById('participantes-count');
    
    if (participarBtn) {
        let numParticipantes = 1428; // Valor inicial
        participarBtn.addEventListener('click', () => {
            numParticipantes++;
            participantesCount.textContent = numParticipantes.toLocaleString('pt-BR');
            const novaLargura = Math.min((numParticipantes / 2000) * 100, 100);
            progressBar.style.width = novaLargura + '%';
            participarBtn.textContent = 'Obrigado por participar!';
            participarBtn.disabled = true;
        }, { once: true });
    }

    // --- LÓGICA DO COMPARADOR (Garrafas) ---
    const garrafasInput = document.getElementById('garrafas-input');
    const precoPetInput = document.getElementById('preco-pet-input');
    const precoReutilInput = document.getElementById('preco-reutil-input');

    if (garrafasInput && precoPetInput && precoReutilInput) {
        garrafasInput.addEventListener('input', calcularImpactoProdutos);
        precoPetInput.addEventListener('input', calcularImpactoProdutos);
        precoReutilInput.addEventListener('input', calcularImpactoProdutos);
        calcularImpactoProdutos(); // Roda na primeira vez
    }

    // --- LÓGICA DO DASHBOARD (Widgets E Gráfico) ---
    carregarDashboard(); // Carrega os widgets (R$, CO2, Lixo)
    
    const formCheckin = document.getElementById('checkin-form');
    const viewSelect = document.getElementById('chart-view-select');

    if (formCheckin && viewSelect) { // Só roda se estiver na pág do dashboard
        formCheckin.addEventListener('submit', salvarCheckin);
        viewSelect.addEventListener('change', renderizarGrafico);
        renderizarGrafico(); // Desenha o gráfico na primeira vez
    }

    // --- LÓGICA DA CALCULADORA DE ÁGUA (NOVO) ---
    const banhoSlider = document.getElementById('banho-minutos');
    const loucaSlider = document.getElementById('louca-minutos');
    const descargaSlider = document.getElementById('descarga-vezes');
    const maquinaSlider = document.getElementById('maquina-vezes');
    const btnSalvarAgua = document.getElementById('salvar-consumo-agua');

    if (banhoSlider) { // Checa se estamos na página da calculadora
        banhoSlider.addEventListener('input', calcularConsumoAgua);
        loucaSlider.addEventListener('input', calcularConsumoAgua);
        descargaSlider.addEventListener('input', calcularConsumoAgua);
        maquinaSlider.addEventListener('input', calcularConsumoAgua);
        btnSalvarAgua.addEventListener('click', salvarConsumoAgua);
        calcularConsumoAgua(); // Roda na primeira vez
    }

    // --- INICIALIZAÇÃO DE ÍCONES (Lucide) ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    const metaForm = document.getElementById('meta-form');
    
    if (metaForm) { // Só roda se estiver na pág do dashboard
        metaForm.addEventListener('submit', salvarMeta);
    }
});