// Funcionalidade básica para os botões
document.addEventListener('DOMContentLoaded', function() {
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

    // Adicionar classe active para o link ativo na navegação
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
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

    // Adicionar funcionalidade de menu móvel (se necessário no futuro)
    // Esta é uma base para quando for implementar o menu mobile
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
document.addEventListener('DOMContentLoaded', function() {
    // ... (seu código JS existente vai aqui em cima)

    // --- LÓGICA DO SIMULADOR DE IMPACTO ---
    const lampadasSlider = document.getElementById('lampadas-slider');
    const lampadasValor = document.getElementById('lampadas-valor');
    const economiaEnergia = document.getElementById('economia-energia');
    const economiaReais = document.getElementById('economia-reais');
    const reducaoCO2 = document.getElementById('reducao-co2');

    function calcularImpacto() {
        if (!lampadasSlider) return; // Se o elemento não existir, pare

        const numLampadas = parseInt(lampadasSlider.value);

        // --- Constantes para o cálculo (valores aproximados) ---
        const consumoIncandescente = 60; // watts
        const consumoLED = 9; // watts
        const horasPorDia = 6;
        const diasPorAno = 365;
        const precoKWh = 0.90; // R$
        const fatorCO2 = 0.0891; // kg de CO₂ por kWh no Brasil (pode variar)

        // --- Cálculos ---
        const economiaWatts = (consumoIncandescente - consumoLED) * numLampadas;
        const economiaKWhAno = (economiaWatts * horasPorDia * diasPorAno) / 1000;
        const economiaReaisAno = economiaKWhAno * precoKWh;
        const reducaoCO2Ano = economiaKWhAno * fatorCO2;

        // --- Atualizar a UI ---
        lampadasValor.textContent = numLampadas;
        economiaEnergia.textContent = economiaKWhAno.toFixed(0);
        economiaReais.textContent = 'R$ ' + economiaReaisAno.toFixed(2).replace('.', ',');
        reducaoCO2.textContent = reducaoCO2Ano.toFixed(1).replace('.', ',') + ' kg';
    }

    if (lampadasSlider) {
        lampadasSlider.addEventListener('input', calcularImpacto);
        // Calcula o valor inicial ao carregar a página
        calcularImpacto();
    }


    // --- LÓGICA DOS DESAFIOS SEMANAIS ---
    const participarBtn = document.getElementById('participar-btn');
    const progressBar = document.getElementById('progress-bar');
    const participantesCount = document.getElementById('participantes-count');
    
    if (participarBtn) {
        let participou = false; // Simples controle de estado
        let numParticipantes = 1428; // Número inicial

        participarBtn.addEventListener('click', () => {
            if (participou) return;

            participou = true;
            numParticipantes++;

            // Atualiza o contador de participantes
            participantesCount.textContent = numParticipantes.toLocaleString('pt-BR');

            // Atualiza a barra de progresso (simulação de meta de 2000)
            const novaLargura = Math.min((numParticipantes / 2000) * 100, 100);
            progressBar.style.width = novaLargura + '%';

            // Feedback visual para o usuário
            participarBtn.textContent = 'Obrigado por participar!';
            participarBtn.disabled = true;
        });
    }

    // É importante chamar createIcons() novamente se houver ícones adicionados
    // ou se o conteúdo for gerado dinamicamente no futuro.
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

});