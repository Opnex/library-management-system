// Initialize state
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let books = JSON.parse(localStorage.getItem('books')) || [];
let users =  JSON.parse(localStorage.getItem('users')) || [];


// Load data from JSON
async function loadLibraryData() {
  try {
    const response = await fetch('library-data.json');
    const data = await response.json();
    console.log(data,9);
    
    if (books.length === 0) {
      books = data.books;
      console.log(books);
      
      localStorage.setItem('books', JSON.stringify(books));
    } else {
      books = JSON.parse(localStorage.getItem('books'));
    }
    if (users.length === 0) {
      console.log(users);

    localStorage.setItem('users', JSON.stringify(data.users));
    
    }
  } catch (error) {
    console.error('Error loading library data:', error);
    localStorage.setItem('books', JSON.stringify([]));
    localStorage.setItem('users', JSON.stringify([]));
    return { users: [], books: [] };
  }
}

// Save books to localStorage
function saveBooks() {
  localStorage.setItem('books', JSON.stringify(books));
}

// Display books for user or librarian
function displayBooks() {
  const userBookList = document.getElementById('userBookList');
  const librarianBookList = document.getElementById('librarianBookList');
  if (userBookList) userBookList.innerHTML = '';
  if (librarianBookList) librarianBookList.innerHTML = '';

  const borrowedBooksList = document.getElementById('borrowedBooksList');
  if (borrowedBooksList) borrowedBooksList.innerHTML = '';

  // Display available books
  books.forEach(book => {
    const bookCard = createBookCard(book);
    
    if (currentUser?.role === 'user' && userBookList) {
      if (book.isAvailable) {
        userBookList.appendChild(bookCard);
      }
      // Display in borrowed list if borrowed by current user
      if (!book.isAvailable && book.borrowedBy === currentUser.username) {
        const borrowedCard = createBookCard(book, true);
        borrowedBooksList.appendChild(borrowedCard);
      }
    } else if (currentUser?.role === 'librarian' && librarianBookList) {
      librarianBookList.appendChild(bookCard);
    }
  });

  // Search functionality
  document.getElementById('searchButton')?.addEventListener('click', () => {
    const searchTerm = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
    const filteredBooks = books.filter(book =>
      searchTerm === '' ||
      book.title?.toLowerCase().includes(searchTerm) ||
      book.author?.toLowerCase().includes(searchTerm) ||
      book.genre?.toLowerCase().includes(searchTerm)
    );
    displaySearchResults(filteredBooks);
  });

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    displayBooks();
  });

  // Show/hide borrowed books section
  const myBorrowedBooks = document.getElementById('myBorrowedBooks');
  if (myBorrowedBooks) {
    const hasBorrowedBooks = books.some(book => 
      !book.isAvailable && book.borrowedBy === currentUser?.username
    );
    myBorrowedBooks.style.display = hasBorrowedBooks ? 'block' : 'none';
  }
}

// Create book card element ()
function createBookCard(book) {
  const bookCard = document.createElement('div');
  bookCard.className = `book-card ${book.isAvailable ? '' : 'not-available'}`;
  
  const borrowDate = book.borrowDate ? new Date(book.borrowDate) : null;
  const dueDate = book.dueDate ? new Date(book.dueDate) : null;
  
  bookCard.innerHTML = `
    <img src="${book.coverImage}" alt="${book.title} cover"
      onerror="this.src='https://images.unsplash.com/photo-1544716278-ca5e3f4ebf0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'">
    <div class="book-info">
      <strong>${book.title}</strong>
      <p>by ${book.author}</p>
      <p>Genre: ${book.genre}</p>
      <span class="badge ${book.isAvailable ? 'bg-success' : 'bg-danger'}">
        ${book.isAvailable ? 'Available' : 'Borrowed'}
      </span>
      ${!book.isAvailable && borrowDate && dueDate ? `
        <div class="borrow-dates">
          <small>Borrowed: ${borrowDate.toLocaleDateString()}</small>
          <small>Due: ${dueDate.toLocaleDateString()}</small>
        </div>
      ` : ''}
    </div>
    <div class="book-actions">
      ${currentUser?.role === 'user' ? `
        <button class="btn btn-sm ${book.isAvailable ? 'btn-primary' : 'btn-secondary'}"
          onclick="handleBookAction(${book.id}, '${book.isAvailable ? 'borrow' : 'return'}')">
          ${book.isAvailable ? 'Borrow' : 'Return'}
        </button>
      ` : ''}
      ${currentUser?.role === 'librarian' ? `
        <button class="btn btn-sm btn-danger"
          onclick="handleBookAction(${book.id}, 'delete')"
          data-bs-toggle="tooltip" title="Delete this book">
          Delete
        </button>
      ` : ''}
    </div>
  `;
  
  return bookCard;
}

// Display search results
function displaySearchResults(filteredBooks) {
  const userBookList = document.getElementById('userBookList');
  const borrowedBooksList = document.getElementById('borrowedBooksList');
  if (!userBookList || !borrowedBooksList) return;

  userBookList.innerHTML = '';
  borrowedBooksList.innerHTML = '';

  if (filteredBooks.length === 0) {
    userBookList.innerHTML = '<p>No books found.</p>';
    return;
  }

  filteredBooks.forEach(book => {
    const bookCard = createBookCard(book);
    
    if (currentUser?.role === 'user' && userBookList) {
      if (book.isAvailable) {
        userBookList.appendChild(bookCard);
      }
      if (!book.isAvailable && book.borrowedBy === currentUser.username) {
        const borrowedCard = createBookCard(book, true);
        borrowedBooksList.appendChild(borrowedCard);
      }
    }
  });
}

// Handle book actions
function handleBookAction(bookId, action) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  if (action === 'borrow' && book.isAvailable) {
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + 14); // Due in 14 days
  
    book.isAvailable = false;
    book.borrowedBy = currentUser.username;
    book.borrowDate = now.toISOString();
    book.dueDate = dueDate.toISOString();
  
    saveBooks();
    displayBooks();
    showAlert(`You borrowed "${book.title}". Due on ${dueDate.toLocaleDateString()}`, 'success');

  } else if (action === 'return' && !book.isAvailable && book.borrowedBy === currentUser.username) {
    book.isAvailable = true;
    delete book.borrowedBy;
    delete book.borrowDate;
    delete book.dueDate;
    saveBooks();
    displayBooks();
    showAlert(`You have successfully returned "${book.title}".`, 'warning');

  } else if (action === 'delete' && currentUser?.role === 'librarian') {
    if (confirm('Are you sure you want to delete this book?')) {
      books = books.filter(b => b.id !== bookId);
      saveBooks();
      displayBooks();
      showAlert(`"${book.title}" has been deleted from the library.`, 'danger');
    }
  }
}

//Section for notification function
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) {
    console.warn('Alert container not found');
    return;
  }

  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`;
  alert.role = 'alert';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alert);

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    alert.classList.remove('show');
    setTimeout(() => alert.remove(), 100);
  }, 3000);
}

// Show/hide sections based on login state
async function updateUI() {
  const heroSection = document.getElementById('heroSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const userDashboard = document.getElementById('userDashboard');
  const librarianDashboard = document.getElementById('librarianDashboard');
  const welcomeMessage = document.getElementById('welcomeMessage');

  // const libraryData = await loadLibraryData(); // Load users as well

  if (currentUser) {
    if (heroSection) heroSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (welcomeMessage) welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;
    if (userDashboard) {
      userDashboard.style.display = currentUser.role === 'user' ? 'block' : 'none';
    }
    if (librarianDashboard) {
      librarianDashboard.style.display = currentUser.role === 'librarian' ? 'block' : 'none';
    }
    displayBooks();
  } else {
    if (heroSection) heroSection.style.display = 'flex';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (userDashboard) userDashboard.style.display = 'none';
    if (librarianDashboard) librarianDashboard.style.display = 'none';
  }
}

// Handle login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  // const role = document.getElementById('loginRole').value;
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginError = document.getElementById('loginError');

  const libraryData = await loadLibraryData();
  const users = JSON.parse(localStorage.getItem('users')) || []; // Directly get users from localStorage
  const user = users.find(u => u.username === username
    && u.password === password
    // && u.role === role
  );

  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (loginError) loginError.style.display = 'none';
    const loginModal = document.getElementById('loginModal');
    if (loginModal) bootstrap.Modal.getInstance(loginModal)?.hide();
    updateUI();
  } else {
    
    if (loginError) {
      loginError.textContent = 'Invalid username or password.';
      loginError.style.display = 'block';
    }
  }
});

// Handle registration
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value;
  const registerError = document.getElementById('registerError');

  if (!username || !password) {
    if (registerError) {
      registerError.textContent = 'Please enter a username and password.';
      registerError.style.display = 'block';
    }
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(user => user.username === username)) {
    if (registerError) {
      registerError.textContent = 'Username already exists. Please choose another one.';
      registerError.style.display = 'block';
    }
    return;
  }

  const newUser = { username: username, password: password, role: 'user' };
  users.push(newUser); // Add the new user to the local array FIRST
  localStorage.setItem('users', JSON.stringify(users)); // THEN save the updated array to localStorage

  if (registerError) registerError.style.display = 'none';
  const registerModal = document.getElementById('registerModal');
  if (registerModal) bootstrap.Modal.getInstance(registerModal)?.hide();
  showAlert('Registration successful! You can now log in.', 'success');

  // Optionally, automatically switch back to the login modal
  const loginModal = document.getElementById('loginModal');
  if (loginModal) {
    const bsLoginModal = bootstrap.Modal.getOrCreateInstance(loginModal);
    bsLoginModal.show();
  }
});


// Handle add book form
document.getElementById('addBookForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (currentUser?.role !== 'librarian') return;

  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const genre = document.getElementById('bookGenre').value.trim();
  const coverImage = document.getElementById('bookCover').value.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4ebf0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

  if (title && author && genre) {
    const newId = books.length ? Math.max(...books.map(b => b.id)) + 1 : 1;
    books.push({ id: newId, title, author, genre, isAvailable: true, coverImage });
    saveBooks();
    displayBooks();
    showAlert(`"${title}" has been added to the library.`, 'success');
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) addBookForm.reset();
  }
});

// Handle logout
document.getElementById('logoutButton')?.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  updateUI();
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  if (loginForm) loginForm.reset();
  if (loginError) loginError.style.display = 'none';
});

// Initial UI update
updateUI();