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
});