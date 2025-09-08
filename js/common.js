document.addEventListener('DOMContentLoaded', () => {
    const navSilent = document.getElementById('nav-silent');
    const navMain = document.getElementById('nav-main');
    const navQC = document.getElementById('nav-qc');
    const navConfig = document.getElementById('nav-config');
    const pageSilent = document.getElementById('page-silent');
    const pageMain = document.getElementById('page-main');
    const pageQC = document.getElementById('page-qc');
    const pageConfig = document.getElementById('page-config');

    function switchPage(page) {
        [pageSilent, pageMain, pageQC, pageConfig].forEach(p => p.classList.remove('active'));
        [navSilent, navMain, navQC, navConfig].forEach(n => n.classList.remove('active'));
        if (page === 'silent') {
            pageSilent.classList.add('active');
            navSilent.classList.add('active');
        } else if (page === 'main') {
            pageMain.classList.add('active');
            navMain.classList.add('active');
        } else if (page === 'qc') {
            pageQC.classList.add('active');
            navQC.classList.add('active');
        } else if (page === 'config') {
            pageConfig.classList.add('active');
            navConfig.classList.add('active');
        }
    }

    function handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (['silent', 'main', 'qc', 'config'].includes(hash)) {
            switchPage(hash);
        } else {
            switchPage('silent');
        }
    }

    navSilent.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'silent';
    });

    navMain.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'main';
    });

    navQC.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'qc';
    });

    navConfig.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'config';
    });

    window.addEventListener('hashchange', handleHash);
    handleHash();
});
