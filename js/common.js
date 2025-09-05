document.addEventListener('DOMContentLoaded', () => {
    const navSilent = document.getElementById('nav-silent');
    const navMain = document.getElementById('nav-main');
    const pageSilent = document.getElementById('page-silent');
    const pageMain = document.getElementById('page-main');

    function switchPage(page) {
        if (page === 'silent') {
            pageSilent.classList.add('active');
            pageMain.classList.remove('active');
            navSilent.classList.add('active');
            navMain.classList.remove('active');
        } else {
            pageSilent.classList.remove('active');
            pageMain.classList.add('active');
            navSilent.classList.remove('active');
            navMain.classList.add('active');
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
});
