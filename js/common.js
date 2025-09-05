document.addEventListener('DOMContentLoaded', () => {
    const navSilent = document.getElementById('nav-silent');
    const navMain = document.getElementById('nav-main');
    const navQC = document.getElementById('nav-qc');
    const pageSilent = document.getElementById('page-silent');
    const pageMain = document.getElementById('page-main');
    const pageQC = document.getElementById('page-qc');

    function switchPage(page) {
        pageSilent.classList.toggle('active', page === 'silent');
        pageMain.classList.toggle('active', page === 'main');
        pageQC.classList.toggle('active', page === 'qc');
        navSilent.classList.toggle('active', page === 'silent');
        navMain.classList.toggle('active', page === 'main');
        navQC.classList.toggle('active', page === 'qc');
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
