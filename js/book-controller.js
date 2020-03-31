'use strict';


window.onclick = function (event) {
    var elModal = document.querySelector('.modal');
    if (event.target != elModal) {
        if(elModal.classList.contains('show')) {

            elModal.classList.remove('show');
        }
    }
}

function onInit() {

    document.querySelector('.book-edit').classList.add('hidden');
    restViewButtons(gView);
    createBook();
    renderBooksHelper();
}


function onViewChange(viewType) {

    if (viewType === gView) return;
    gViewChanged = true;
    gView = viewType;
    restViewButtons(gView);
    
    renderBooksHelper();
}

function setPageSelect() {

    var elPageNum = document.querySelectorAll(`.page-num-${gPageIdx}`);

    elPageNum.forEach(pageNums => {
        
        pageNums.classList.add('selected-books-page');
    });
}

// Renders page number buttons
function renderPageNumbers() {

    gPages = Math.ceil(gBooks.length / PAGE_SIZE);

    var elPageNumbers = document.querySelectorAll('.page-numbers');
    var strHtml = '';

    for (let i = 0; i < gPages; i++) {

        strHtml += `<div onclick="onNextPage(${i}, this)" class="pages-nums page-num-${i}">${i + 1}</div>`;
    }

    elPageNumbers.forEach(pageNumberSet => {
        pageNumberSet.innerHTML = strHtml;
    });

}

function renderBooksHelper() {

    PAGE_SIZE = (gView === 'tiles') ? Math.floor(PAGE_SIZE_BASE / 2) : PAGE_SIZE_BASE; 
    renderPageNumbers();
    
    resetPagesSelect();
    setPageSelect();

    if (gView === 'tiles') renderBooks();
    else if (gView === 'list') renderBooksList();

}

// Tiles version of 'renderBooks'
function renderBooks() {

    var books = getBooks();
    var transFont = (gCurrLang === 'he') ? 'rtl-font' : '';

    var strHtmls = books.map(function getBookHTML(book) {

        return `
        <article class="book-preview" onclick="onReadBook('${book.id}')">
        <span class="delete-btn"><i class="fas fa-times-circle fa-2x del-book-button book-buttons" onclick="onDeleteBook('${book.id}', this)"></i></span>
        <span class="edit-btn" onclick="onUpdateBook('${book.id}')"><i class="fas fa-pen-square fa-2x edit-book-button book-buttons"></i></span>
        <img class="book-img-top" src="${book.img}" alt="Book image cap">
            <div class="card-body">
                <p class="card-title">${book.name}</p>
                <p class="card-title-second">${book.author}</p>
                <p class="card-text ${transFont}">${getTrans("tiles-rating")} <span class="book-preview-stat">${book.rating}</span></p>
                <p class="card-text ${transFont}">${getTrans("tiles-price")} <span class="book-preview-stat">$${book.price}</span></p>
                </div>
                </article> 
                `
    })
    document.querySelector('.books-container').innerHTML = strHtmls.join('')
}


// List version of 'renderBooks' to render list of books
function renderBooksList() {

    var nameHeaderSortStamp = (gSort === 'name') ? 'selected-book-sort' : '';
    var priceHeaderSortStamp = (gSort === 'price') ? 'selected-book-sort' : '';

    var books = getBooks();
    var transFont = (gCurrLang === 'he') ? 'rtl-font' : '';
    var strHtmlsHead = `<div class="books-list-container">

    <div class="books-list-headers ${transFont}">
        <div class="book-image-header" data-trans="list-cover">${getTrans("list-cover")}</div>
        <div class="book-name-header ${nameHeaderSortStamp}" onclick="onSortChange('name')">${getTrans("list-title")} </div>
        <div class="book-price-header ${priceHeaderSortStamp}" onclick="onSortChange('price')">${getTrans("list-price")} </div>
        <div class="book-actions-header">${getTrans("list-actions")}</div>
    </div>`;

    var strHtmls = books.map(function getBookHTML(book) {
        return `
        <div class="book-listing">
                    <div class="book-image"><img
                            src="${book.img}"
                            alt="${getTrans("list-cover")}"></div>
                    <div class="book-name"><span class="name-span">${book.name}</span></div>
                    <div class="book-price">$${book.price}</div>
                    <div class="book-actions">
                        <button class="read-list-btn list-btn ${transFont}" onclick="onReadBook('${book.id}')">${getTrans("list-action-read")}</button>
                        <button class="edit-list-btn list-btn ${transFont}" onclick="onUpdateBook('${book.id}')">${getTrans("list-action-update")}</button>
                        <button class="delete-list-btn list-btn ${transFont}" onclick="onDeleteBook('${book.id}')">${getTrans("list-action-delete")}</button>
                    </div>
                </div> 
                `
    });
    strHtmls = strHtmlsHead + strHtmls.join('') + '</div>';

    document.querySelector('.books-container').innerHTML = strHtmls;

    
}

function onSortChange(sortType) {

    gSort = (gSort === sortType) ? '-' + sortType : sortType;

    renderBooksHelper();

    var elSortBy = document.querySelector(`.book-${sortType}-header`);
    var sortDirection = '';
    sortDirection = (gSort[0] === '-') ? 'down' : 'up';
    elSortBy.innerHTML += `<i class="far fa-arrow-alt-circle-${sortDirection}"></i>`
    elSortBy.classList.add('selected-book-sort');

}

function onDeleteBook(bookId, elDeleteButton) {
    event.stopPropagation();

    if(elDeleteButton.classList.contains('fa-spin')) {

        deleteBook(bookId)
        renderBooksHelper()
        elDeleteButton.classList.remove('fa-spin');
    } else {

        elDeleteButton.classList.add('fa-spin');

        setTimeout(() => {
            elDeleteButton.classList.remove('fa-spin');
        }, 5000);
    }
}

function onShowAddBook() {
    var elAddNewBookSec = document.querySelector('.book-edit');
    elAddNewBookSec.classList.toggle('hidden');
    
    if(elAddNewBookSec.classList.contains('hidden')) elAddNewBookSec.classList.remove('unhidden');
    else elAddNewBookSec.classList.add('unhidden');

}

function onUpdateBook(bookId) {
    event.stopPropagation();
    var newPrice = +prompt('Price?');
    updateBook(bookId, newPrice);
    renderBooksHelper();
}

function onReadBook(bookId) {

    event.stopPropagation();

    var elModal = document.querySelector('.modal');

    if(elModal.classList.contains('show')) {

        elModal.classList.remove('show');

        updateModal(elModal, bookId);
        setTimeout(() => {
            
            elModal.classList.add('show');
        }, 200);
    } else {

        updateModal(elModal, bookId);
        elModal.classList.add('show');
    }
}

function updateModal(elModal, bookId) {
    
    var book = getBookById(bookId);
    elModal.querySelector('.modal-book-name').innerText = book.name;
    elModal.querySelector('img').src = book.img;
    elModal.querySelector('.modal-book-author').innerText = book.author;
    elModal.querySelector('.modal-rating').innerText = book.rating;
    elModal.querySelector('.modal-price').innerText = book.price;
    elModal.querySelector('.modal-desc').innerText = book.desc;
}

// Animating the add button for a loading effect
function animateLoading(animate) {

    var elAddBookButtonIcon = document.querySelector('.add-book-btn');
    var elAddBookButton = document.querySelector('.add-book-button');

    if (animate) {
        elAddBookButton.classList.add('book-add-load')
        elAddBookButtonIcon.classList.add('fa-spin');
    }
    else {

        elAddBookButton.classList.remove('book-add-load');
        elAddBookButtonIcon.classList.remove('fa-spin');

    }
}

async function onSaveBook() {
    const elBookEdit = document.querySelector('.book-edit');

    const elAuthorInput = elBookEdit.querySelector('input[name="author"]');
    const elNameInput = elBookEdit.querySelector('input[name="name"]');
    const elPriceInput = elBookEdit.querySelector('input[name="price"]');

    const author = elAuthorInput.value;
    const name = elNameInput.value;
    const price = elPriceInput.value;

    animateLoading(true);
    await addBook(name, author, price);
    animateLoading(false);
    document.querySelector('.book-edit').classList.add('hidden');
    renderBooksHelper();
    elAuthorInput.value = elNameInput.value = elPriceInput.value = '';

    elBookEdit.hidden = true;
}

function onNextPage(action, elPage) {
    
    if(gPages <= 1) return;

    nextPage(action);
    if(newPageChange) renderBooksHelper(elPage);
}

function restViewButtons(viewType) {

    var elTilesView = document.querySelector('.fa-microsoft');
    var elListView = document.querySelector('.fa-th-list');

    if (elListView.classList.contains('selected-view')) elListView.classList.remove('selected-view');
    if (elTilesView.classList.contains('selected-view')) elTilesView.classList.remove('selected-view');

    (viewType === 'tiles') ? elTilesView.classList.add('selected-view') : elListView.classList.add('selected-view');
}

function onSetLang(lang) {
    setLang(lang);

    if (lang === 'he') document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
    doTrans();
    renderBooksHelper();
}

