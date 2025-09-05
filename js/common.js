document.addEventListener('DOMContentLoaded', () => {
    const navSilent = document.getElementById('nav-silent');
    const navMain = document.getElementById('nav-main');
    const navQC = document.getElementById('nav-qc');
    const pageSilent = document.getElementById('page-silent');
    const pageMain = document.getElementById('page-main');
    const pageQC = document.getElementById('page-qc');

    function switchPage(page) {
        [pageSilent, pageMain, pageQC].forEach(p => p.classList.remove('active'));
        [navSilent, navMain, navQC].forEach(n => n.classList.remove('active'));
        if (page === 'silent') {
            pageSilent.classList.add('active');
            navSilent.classList.add('active');
        } else if (page === 'main') {
            pageMain.classList.add('active');
            navMain.classList.add('active');
        } else if (page === 'qc') {
            pageQC.classList.add('active');
            navQC.classList.add('active');
        }
    }

    navSilent.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('silent');
    });

    navMain.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('main');
    });

    navQC.addEventListener('click', (e) => {
        e.preventDefault();
        switchPage('qc');
    });
});
