// Adicionando funcionalidade básica para os botões
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
});