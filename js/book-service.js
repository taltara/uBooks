'use strict'

const KEY = 'books';
var gBooks = [];
var PAGE_SIZE;
const PAGE_SIZE_BASE = 14;
var gPageIdx = 0;
var newPageChange = true;
var gView = 'tiles';
var gViewChanged = false;
var gSort = '';
var gPages = 1;
var gCurrLang = 'en';
const defaultBookCover = '../images/default-book-cover.jpg';

var gTrans = {
    'input-author': {
        en: 'Author:',
        es: 'El Autor:',
        he: 'סופר:'
    },
    'input-title': {
        en: 'Title:',
        es: 'El Título:',
        he: 'שם:',
    },
    'input-price': {
        en: 'Price: $',
        es: 'El Precio: $',
        he: 'מחיר: $',
    },
    'input-save': {
        en: 'Save',
        es: 'Sumar',
        he: 'הוסף',
    },
    'list-title': {
        en: 'Title',
        es: 'El Título',
        he: 'שם',
    },
    'list-price': {
        en: 'Price',
        es: 'El Precio',
        he: 'מחיר',
    },
    'list-cover': {
        en: 'Cover',
        es: 'La Tapa',
        he: 'כריכה',
    },
    'list-actions': {
        en: 'Actions',
        es: 'El Acto',
        he: 'פעולות',
    },
    'list-action-read': {
        en: 'Read',
        es: 'Leer',
        he: 'קרא',
    },
    'list-action-update': {
        en: 'Update',
        es: 'Actualizar',
        he: 'עדכן',
    },
    'list-action-delete': {
        en: 'Delete',
        es: 'Eliminar',
        he: 'הסר',
    },
    'tiles-rating': {
        en: 'Rating:',
        es: 'La Clasific:',
        he: 'דירוג:'
    },
    'tiles-price': {
        en: 'Price:',
        es: 'El Precio:',
        he: 'מחיר:'
    },
    'modal-rating': {
        en: 'Rating:',
        es: 'La Clasific:',
        he: 'דירוג:'
    },
    'modal-price': {
        en: 'Price: $',
        es: 'El Precio: $',
        he: 'מחיר: $'
    },
    'modal-desc': {
        en: 'Description:',
        es: 'La Descripción:',
        he: 'תקציר:'
    },
}


// Powerful sorting function for numbers and strings with reverse functionality
function sortByType(sortType) {

    var sortOrder = 1;
    if (sortType[0] === "-") {
        sortOrder = -1;
        sortType = sortType.substr(1);
    }

    if (sortType === 'name') {

        return function (a, b) {

            var result = (a[sortType].toLowerCase() < b[sortType].toLowerCase()) ? -1 :
                (a[sortType].toLowerCase() > b[sortType].toLowerCase()) ? 1 : 0;
            return result * sortOrder;
        }

    } else {

        return function (a, b) {

            var result = (a[sortType] < b[sortType]) ? -1 : (a[sortType] > b[sortType]) ? 1 : 0;
            return result * sortOrder;
        }
    }
}

function nextPage(action) {

    if (action === 'forward') {

        action = 1;
        if (gPageIdx < gPages - 1) gPageIdx += action;
        else gPageIdx = 0;
    }
    else if (action === 'back') {

        action = -1;
        if (gPageIdx > 0) gPageIdx += action;
        else gPageIdx = gPages - 1;

    } else {

        if(gPageIdx === action) {

            newPageChange = false;

        } else {

            newPageChange = true;
            gPageIdx = action;
        }
    }
}

function resetPagesSelect() {

    var elAllPageNumbers = document.querySelectorAll('.pages-nums');

    elAllPageNumbers.forEach(elPageNum => {

        if (elPageNum.classList.contains('selected-books-page')) {

            elPageNum.classList.remove('selected-books-page');
        }
    })
}

function getBooks() {

    if (!gBooks || !gBooks.length) return [];

    var startIdx; 
    if(gViewChanged) {

        startIdx = 0;
        gViewChanged = false;
        gPageIdx = 0;
        resetPagesSelect();
        setPageSelect();
    } else {

        startIdx = gPageIdx * PAGE_SIZE;
    } 

    if (gSort != '') {

        var sortedBooks = gBooks.slice(0);
        
        sortedBooks.sort(sortByType(gSort));
        return sortedBooks.slice(startIdx, startIdx + PAGE_SIZE);
    }


    return gBooks.slice(startIdx, startIdx + PAGE_SIZE);
}

function getAuthors() {
    return gAuthors;
}

function deleteBook(bookId) {
    var bookIdx = gBooks.findIndex(function (book) {
        return bookId === book.id;
    })
    gBooks.splice(bookIdx, 1);
    _saveBooksToStorage();

}

async function addBook(name, author, price) {

    var book = await _createBook(name, author, price);

    if (!gBooks || !gBooks.length) gBooks = [book];
    else gBooks.unshift(book);

    _saveBooksToStorage();
}

function getBookById(bookId) {
    var book = gBooks.find(function (book) {
        return bookId === book.id;
    })
    return book;
}

function updateBook(bookId, newPrice) {
    const book = gBooks.find(function (book) {
        return book.id === bookId;
    })
    book.price = newPrice;

    _saveBooksToStorage();
}

async function _createBook(name, author, price) {
    if (!price) price = getRandomFloatInclusive(10, 70);

    var bookInfo = await getBookApiInfo(name, author);
    console.log(bookInfo);
    if(bookInfo['items'] != undefined) {

        bookInfo = bookInfo['items'][0].volumeInfo;
        
        var SafeBookCoverLink = bookInfo.imageLinks.thumbnail.slice(0,4) + 's' + bookInfo.imageLinks.thumbnail.slice(4,);
        console.log(SafeBookCoverLink);
        
        return {
            id: makeId(),
            name: bookInfo.title,
            author: author,
            price: price,
            rating: (bookInfo.averageRating === undefined) ? Math.ceil(Math.random() * 5) : bookInfo.averageRating,
            desc: (bookInfo.description === undefined) ? makeLorem() : bookInfo.description,
            img: (bookInfo.imageLinks === undefined) ? defaultBookCover : SafeBookCoverLink
        };

    } else {

        return {
            id: makeId(),
            name: name,
            author: author,
            price: price,
            rating: '',
            desc: '', 
            img: defaultBookCover
        };
    }
}

// Extracting Google Books Api info for added books
async function getBookApiInfo(name, author) {

    try {
        let bookApiRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${name}+inauthor:${author}&key=AIzaSyDhs5CgUBpYIb22Hm2DV_ESjLsOKSDnQpU`);
        return await bookApiRes.json();
    } catch (err) {
        console.error(err);
    }
}

function createBook() {
    var books = loadFromStorage(KEY);
    gBooks = books;
    _saveBooksToStorage();
}

function _saveBooksToStorage() {
    saveToStorage(KEY, gBooks);
}

function openShula() {

    window.open("https://taltara.github.io/MineSweeper-JS/");
}

function getTrans(transKey) {
    // Get from gTrans
    var langTransMap = gTrans[transKey]
    // If key is unknown return 'UNKNOWN'
    if (!langTransMap) return 'UNKNOWN';
    
    // If translation not found - use english
    var trans = langTransMap[gCurrLang]
    if (!trans) trans = langTransMap['en']
    return trans;
}

function doTrans() {
    var els = document.querySelectorAll('[data-trans]')
    console.log('els', els);
    els.forEach(el =>{
        const key = el.dataset.trans;
        const trans = getTrans(key)

        if (el.placeholder)  el.placeholder = trans
        else el.innerText = trans
    }) 
}

function setLang(lang) {
    gCurrLang = lang;
}

function formatNumOlder(num) {
    return num.toLocaleString('es')
}

function formatNum(num) {
    return new Intl.NumberFormat(gCurrLang).format(num);
}

function formatCurrency(num) {
    return new Intl.NumberFormat('he-IL',{ style: 'currency', currency: 'ILS' }).format(num);
}

function formatDate(time) {

    var options = {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: 'numeric',
        hour12: true,
    };

    return new Intl.DateTimeFormat(gCurrLang,options).format(time);
}

function kmToMiles(km) {
    return km / 1.609;
}