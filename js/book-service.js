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
const defaultBookCover = '../images/default-book-cover.jpg';

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
        
        bookInfo.imageLinks.thumbnail = bookInfo.imageLinks.thumbnail.slice(0,4) + 's' + bookInfo.imageLinks.thumbnail.slice(4,);
        return {
            id: makeId(),
            name: bookInfo.title,
            author: author,
            price: price,
            rating: (bookInfo.averageRating === undefined) ? Math.ceil(Math.random() * 5) : bookInfo.averageRating,
            desc: (bookInfo.description === undefined) ? makeLorem() : bookInfo.description,
            img: (bookInfo.imageLinks === undefined) ? defaultBookCover : bookInfo.imageLinks.thumbnail
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
    saveToStorage(KEY, gBooks)
}

function openShula() {

    window.open("https://taltara.github.io/MineSweeper-JS/");
}