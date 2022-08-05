//id: string | number
//title: string
//author: string
//year: number
//isComplete: boolean

let books = [];
const RENDER_EVENT = 'render-book';

const SAVED_EVENT = 'saved-book';
const LOCAL_KEY = 'book-key';

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h2');
    bookTitle.innerText = 'Judul : '+bookObject.title;
    
    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = 'Penulis : ' +bookObject.author;

    const bookYear = document.createElement('p');
    bookYear.innerText = 'Tahun : ' +bookObject.year;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const container = document.createElement('div');
    container.classList.add('book_item');
    container.append(bookTitle, bookAuthor, bookYear);
    container.append(buttonContainer);

    container.setAttribute('id',`book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText="Belum selesai dibaca";
        undoButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText="Hapus buku";
        deleteButton.addEventListener('click', function () {
            swal({ //additional feature : delete modal using sweet alert
                title: "Hapus buku?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    removeBookFromCompleted(bookObject.id);
                    swal("Buku sudah dihapus", {
                    icon: "success",
                    });
                } else {
                    swal("Buku tidak dihapus");
                }
            });
        });
        buttonContainer.append(undoButton, deleteButton);
    }

    else {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText="Selesai dibaca";
        undoButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('red');
        deleteButton.innerText="Hapus buku";
        deleteButton.addEventListener('click', function () {
            swal({ //additional feature : delete modal using sweet alert
                title: "Hapus buku?",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            })
            .then((willDelete) => {
                if (willDelete) {
                    removeBookFromCompleted(bookObject.id);
                    swal("Buku sudah dihapus", {
                    icon: "success",
                    });
                } else {
                    swal("Buku tidak dihapus");
                }
            });
        });
        buttonContainer.append(undoButton, deleteButton);
    }
    return container;
}

//input book data
function addBook () {
    const bookTitle = document.getElementById('title').value;
    const bookAuthor = document.getElementById('author').value;
    const bookYear = document.getElementById('year').value;
    const isCompleted = document.getElementById('isComplete').checked;

    const generateID = generateId();
    const bookObject = generateBookObject(generateID, bookTitle, bookAuthor,bookYear, isCompleted)
    books.push(bookObject);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

//add book to completed list
function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

//remove book from completed
function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
    
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

//undo book from completed
function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    
    saveData();
}

//submit data and load from ls if data already existed
document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    const searchForm = document.getElementById('searchBook');

    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        searchBook();
        document.dispatchEvent(new Event (RENDER_EVENT));
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

document.addEventListener(RENDER_EVENT,function() {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    const completedBookList = document.getElementById('completeBookshelfList');

    //clearing list item
    uncompletedBookList.innerHTML = '';
    completedBookList.innerHTML = '';

    for (const bookItem of searchBook()) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedBookList.append(bookElement);
        }
        else {
            completedBookList.append(bookElement);
        }
    }
});

//additional feature : search book
// function searchBook() {
//     const title = document.getElementById('searchBookTitle').value;
//     const serializedData = localStorage.getItem(LOCAL_KEY);
//     const data = JSON.parse(serializedData);
//     const filterBooks = data.filter (function(book) {
//         return book.title.toLowerCase().includes(title.toLowerCase()); //ignore case sensitive
//     });
//     if (filterBooks.length === 0) {
//         alert('Not Found');
//         return location.reload();
//     }

//     if (title !== '') {
//         books = [];
//         for (const book of filterBooks) {
//             books.push(book);
//         }
//         document.dispatchEvent(new Event(RENDER_EVENT));
//     }
//     else {
//         books = [];
//         loadDataFromStorage();
//     }
// };
function searchBook() {
    const title = document.getElementById('searchBookTitle').value;
    const filterBooks = books.filter(function(book) {
        const bookName = book.title.toLowerCase();
        return bookName.includes(title.toLowerCase());
    });
    return filterBooks;
}

//local storage applied
document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(LOCAL_KEY));
});

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(LOCAL_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExist() {
    if (typeof(Storage) === undefined) {
        alert('This Browser does not support Local Storage');
    return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(LOCAL_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event (RENDER_EVENT));
}