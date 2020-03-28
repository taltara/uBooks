'use strict';


window.onclick = function (event) {
    var elModal = document.querySelector('.modal');
    if (event.target != elModal) {
        elModal.hidden = true;
    }
}

function onInit() {

    document.querySelector('.book-edit').classList.add('hidden');
    restViewButtons(gView);
    createBook();
    renderAuthors();
    renderBooksHelper();
}

function renderAuthors() {
    var authors = getAuthors()
    var strHtmls = authors.map(author => `<option>${author}</option>`)
    document.querySelector('.book-edit select').innerHTML = strHtmls.join('')
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

    var books = getBooks()
    var strHtmls = books.map(function getBookHTML(book) {
        return `
        <article class="book-preview" onclick="onReadBook('${book.id}')">
        <span class="delete-btn"><i class="fas fa-times-circle fa-2x del-book-button book-buttons" onclick="onDeleteBook('${book.id}', this)"></i></span>
        <span class="edit-btn" onclick="onUpdateBook('${book.id}')"><i class="fas fa-pen-square fa-2x edit-book-button book-buttons"></i></span>
        <img class="book-img-top" src="${book.img}" alt="Book image cap">
            <div class="card-body">
                <p class="card-title">${book.name}</p>
                <p class="card-title-second">${book.author}</p>
                <p class="card-text">Rating: <span class="book-preview-stat">${book.rating}</span></p>
                <p class="card-text">Price: <span class="book-preview-stat">$${book.price}</span></p>
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
    var strHtmlsHead = `<div class="books-list-container">

    <div class="books-list-headers">
        <div class="book-image-header">Cover</div>
        <div class="book-name-header ${nameHeaderSortStamp}" onclick="onSortChange('name')">Title </div>
        <div class="book-price-header ${priceHeaderSortStamp}" onclick="onSortChange('price')">Price </div>
        <div class="book-actions-header">Actions</div>
    </div>`;

    var strHtmls = books.map(function getBookHTML(book) {
        return `
        <div class="book-listing">
                    <div class="book-image"><img
                            src="${book.img}"
                            alt="Cover"></div>
                    <div class="book-name"><span class="name-span">${book.name}</span></div>
                    <div class="book-price">$${book.price}</div>
                    <div class="book-actions">
                        <button class="read-list-btn list-btn" onclick="onReadBook('${book.id}')">Read</button>
                        <button class="edit-list-btn list-btn" onclick="onUpdateBook('${book.id}')">Update</button>
                        <button class="delete-list-btn list-btn" onclick="onDeleteBook('${book.id}')">Delete</button>
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

function onCloseModal() {
    document.querySelector('.modal').hidden = true
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
    var book = getBookById(bookId)
    var elModal = document.querySelector('.modal')
    elModal.querySelector('.modal-book-name').innerText = book.name;
    elModal.querySelector('img').src = book.img;
    elModal.querySelector('.modal-book-author').innerText = book.author;
    elModal.querySelector('.modal-rating').innerText = book.rating;
    elModal.querySelector('.modal-price').innerText = book.price;
    elModal.querySelector('.modal-desc').innerText = book.desc;
    elModal.hidden = false;
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

    const elAuthorInput = elBookEdit.querySelector('select');
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
    elNameInput.value = elPriceInput.value = '';

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