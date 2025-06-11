
const API_BASE_URL = 'http://localhost:3000';

enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

interface Book {
  id: number;
  title: string;
  author: string;
  publication_year?: number;
  isbn?: string;
  description?: string;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T, message?: string }> {
  try {
    console.log(`Making ${options.method || 'GET'} request to ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    console.log('API Response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

function showToast(message: string, type: ToastType = ToastType.INFO): void {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  
  document.getElementById('toastContainer')?.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function initCommon(): void {
  console.log('Initializing common elements');
  

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mainNav = document.querySelector('.main-nav');
  
  if (mobileMenuBtn && mainNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  }
}

const featuredBooks = document.getElementById('featuredBooks');
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const searchButton = document.getElementById('searchButton');


async function loadFeaturedBooks(): Promise<void> {
  console.log('Loading featured books');
  if (!featuredBooks) return;
  
  featuredBooks.innerHTML = '<div class="loading">Loading featured books...</div>';
  
  try {
    const data = await fetchAPI<Book[]>('/books/all_books?page=1&limit=5');
    
    if (data && data.data && data.data.length > 0) {
      displayFeaturedBooks(data.data);
      
      const viewMoreContainer = document.createElement('div');
      viewMoreContainer.className = 'view-more-container';
      viewMoreContainer.innerHTML = `
          <a href="books.html" class="btn primary-btn view-more-btn">
              View All Books <ion-icon name="arrow-forward-outline"></ion-icon>
          </a>
      `;
      featuredBooks.appendChild(viewMoreContainer);
    } else {
      featuredBooks.innerHTML = '<p>No books found</p>';
    }
  } catch (error) {
    console.error("Error loading featured books:", error);
    featuredBooks.innerHTML = '<p>Error loading books. Please try again later.</p>';
  }
}

function displayFeaturedBooks(books: Book[]): void {
  if (!books || books.length === 0 || !featuredBooks) {
    return;
  }
  
  featuredBooks.innerHTML = '<h2>Latest Books</h2>';
  
  const bookContainer = document.createElement('div');
  bookContainer.className = 'book-container';
  
  books.forEach(book => {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    
    const randomColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
    
    bookCard.innerHTML = `
      <div class="book-card-img" style="background-color: ${randomColor}">
          <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: rgba(0,0,0,0.2);">
              <ion-icon name="book-outline"></ion-icon>
          </div>
      </div>
      <div class="book-card-content">
          <h3>${book.title}</h3>
          <p><strong>By:</strong> ${book.author || 'Unknown'}</p>
          <div class="book-info">
              <span class="year">${book.publication_year || 'N/A'}</span>
              <button class="view-btn" data-id="${book.id}">
                  <ion-icon name="eye-outline"></ion-icon> View Details
              </button>
          </div>
      </div>
    `;
    
    bookContainer.appendChild(bookCard);
    
    const viewBtn = bookCard.querySelector('.view-btn') as HTMLElement;
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        openBookDetailModal(book.id);
      });
    }
  });
  
  featuredBooks.appendChild(bookContainer);
}

async function openBookDetailModal(bookId: number): Promise<void> {
  const bookDetailModal = document.getElementById('bookDetailModal');
  const bookDetailContent = document.getElementById('bookDetailContent');
  
  if (!bookDetailModal || !bookDetailContent) return;
  
  bookDetailContent.innerHTML = '<div class="loading">Loading book details...</div>';
  bookDetailModal.style.display = 'block';
  
  try {
    const data = await fetchAPI<Book>(`/books/${bookId}`);
    
    if (data && data.data) {
      const book = data.data;
      
      const randomColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
      
      bookDetailContent.innerHTML = `
        <div class="book-detail-header">
            <div class="book-detail-img" style="background-color: ${randomColor}">
                <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: rgba(0,0,0,0.2);">
                    <ion-icon name="book-outline"></ion-icon>
                </div>
            </div>
            <div class="book-detail-title">
                <h2>${book.title}</h2>
                <p><strong>By:</strong> ${book.author || 'Unknown'}</p>
                <p><strong>Year:</strong> ${book.publication_year || 'N/A'}</p>
                <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
            </div>
        </div>
        
        <div class="book-detail-info">
            <p><strong>Description:</strong></p>
            <p>${book.description || 'No description available.'}</p>
        </div>
        
        <div class="book-detail-actions">
            <a href="books.html" class="btn secondary-btn">
                <ion-icon name="list-outline"></ion-icon> See All Books
            </a>
        </div>
      `;
    } else {
      bookDetailContent.innerHTML = '<p>Failed to load book details</p>';
    }
  } catch (error) {
    console.error(`Error loading book details for ${bookId}:`, error);
    bookDetailContent.innerHTML = '<p>Error loading book details. Please try again later.</p>';
  }
}

const booksGrid = document.getElementById('booksGrid');
const booksPagination = document.getElementById('booksPagination');
const addBookBtn = document.getElementById('addBookBtn');
const filterButton = document.getElementById('filterButton');
const yearStartInput = document.getElementById('yearStart') as HTMLInputElement;
const yearEndInput = document.getElementById('yearEnd') as HTMLInputElement;
const bookForm = document.getElementById('bookForm') as HTMLFormElement;
const bookFormModal = document.getElementById('bookFormModal') as HTMLElement;
const cancelBookForm = document.getElementById('cancelBookForm');

let currentPage = 1;
let booksPerPage = 10;
let totalBooksCount = 0;
let currentFilters: { searchTerm?: string, startYear?: number, endYear?: number } = {};

async function loadBooks(page: number = 1, limit: number = 10, filters = currentFilters): Promise<void> {
  console.log(`Loading books (page ${page}, limit ${limit})`, filters);
  if (!booksGrid) return;
  
  booksGrid.innerHTML = '<div class="loading">Loading books...</div>';
  
  let queryParams = `?page=${page}&limit=${limit}`;
  if (filters.searchTerm) queryParams += `&searchTerm=${encodeURIComponent(filters.searchTerm)}`;
  if (filters.startYear) queryParams += `&startYear=${filters.startYear}`;
  if (filters.endYear) queryParams += `&endYear=${filters.endYear}`;
  
  try {
    const data = await fetchAPI<Book[]>(`/books${queryParams}`);
    
    if (data && data.data) {
      displayBooks(data.data);
      
      if (booksPagination) {
        updatePagination(page, Math.ceil(totalBooksCount / limit));
      }
    } else {
      booksGrid.innerHTML = '<p>No books found</p>';
    }
  } catch (error) {
    console.error("Error loading books:", error);
    booksGrid.innerHTML = '<p>Error loading books. Please try again later.</p>';
  }
}

function displayBooks(books: Book[]): void {
  if (!booksGrid) return;
  
  if (!books || books.length === 0) {
    booksGrid.innerHTML = '<p>No books found matching your criteria.</p>';
    return;
  }
  
  booksGrid.innerHTML = '';
  
  books.forEach(book => {
    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    
    const randomColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
    
    bookCard.innerHTML = `
      <div class="book-card-img" style="background-color: ${randomColor}">
        <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: rgba(0,0,0,0.2);">
          <ion-icon name="book-outline"></ion-icon>
        </div>
      </div>
      <div class="book-card-content">
        <h3>${book.title}</h3>
        <p><strong>By:</strong> ${book.author || 'Unknown'}</p>
        <div class="book-info">
          <span class="year">${book.publication_year || 'N/A'}</span>
          <div class="book-actions">
            <button class="action-btn view-btn" data-id="${book.id}">
              <ion-icon name="eye-outline"></ion-icon> View
            </button>
            <button class="action-btn edit-btn" data-id="${book.id}">
              <ion-icon name="create-outline"></ion-icon> Edit
            </button>
            <button class="action-btn delete-btn" data-id="${book.id}">
              <ion-icon name="trash-outline"></ion-icon> Delete
            </button>
          </div>
        </div>
      </div>
    `;
    
    booksGrid.appendChild(bookCard);
    
    const viewBtn = bookCard.querySelector('.view-btn') as HTMLElement;
    const editBtn = bookCard.querySelector('.edit-btn') as HTMLElement;
    const deleteBtn = bookCard.querySelector('.delete-btn') as HTMLElement;
    
    viewBtn?.addEventListener('click', () => {
      openBookDetailModal(book.id);
    });
    
    editBtn?.addEventListener('click', () => {
      openBookFormModal(book.id);
    });
    
    deleteBtn?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
        deleteBook(book.id);
      }
    });
  });
}

function updatePagination(currentPage: number, totalPages: number): void {
  if (!booksPagination) return;
  
  booksPagination.innerHTML = '';
  
  if (totalPages <= 1) {
    return;
  }
  
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn';
  prevBtn.disabled = currentPage === 1;
  prevBtn.innerHTML = '<ion-icon name="arrow-back-outline"></ion-icon>';
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      loadBooks(currentPage - 1);
    }
  });
  booksPagination.appendChild(prevBtn);
  
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    pageBtn.textContent = i.toString();
    pageBtn.addEventListener('click', () => {
      loadBooks(i);
    });
    booksPagination.appendChild(pageBtn);
  }
  
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.innerHTML = '<ion-icon name="arrow-forward-outline"></ion-icon>';
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      loadBooks(currentPage + 1);
    }
  });
  booksPagination.appendChild(nextBtn);
}

async function openBookFormModal(bookId?: number): Promise<void> {
  if (!bookFormModal || !bookForm) return;
  
  bookForm.reset();
  
  const bookFormTitle = document.getElementById('bookFormTitle');
  const bookIdInput = document.getElementById('bookId') as HTMLInputElement;
  const titleInput = document.getElementById('bookTitle') as HTMLInputElement;
  const authorInput = document.getElementById('author') as HTMLInputElement;
  const yearInput = document.getElementById('publicationYear') as HTMLInputElement;
  const isbnInput = document.getElementById('isbn') as HTMLInputElement;
  const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
  const userIdInput = document.getElementById('userId') as HTMLInputElement;
  
  if (bookFormTitle) {
    bookFormTitle.textContent = bookId ? 'Edit Book' : 'Add New Book';
  }
  
  if (bookId) {
    try {
      const data = await fetchAPI<Book>(`/books/${bookId}`);
      
      if (data && data.data) {
        const book = data.data;
        
        bookIdInput.value = book.id.toString();
        titleInput.value = book.title || '';
        authorInput.value = book.author || '';
        yearInput.value = book.publication_year ? book.publication_year.toString() : '';
        isbnInput.value = book.isbn || '';
        descriptionInput.value = book.description || '';
        userIdInput.value = book.user_id ? book.user_id.toString() : '';
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      showToast('Error loading book details', ToastType.ERROR);
    }
  } else {
    bookIdInput.value = '';
  }
  
  bookFormModal.style.display = 'block';
}

async function handleBookFormSubmit(e: Event): Promise<void> {
  e.preventDefault();
  
  if (!bookForm) return;
  
  const formData = new FormData(bookForm);
  const bookId = formData.get('bookId') ? parseInt(formData.get('bookId') as string) : null;
  
  const bookData: Partial<Book> = {
    title: formData.get('title') as string,
    author: formData.get('author') as string,
    publication_year: formData.get('publicationYear') ? parseInt(formData.get('publicationYear') as string) : undefined,
    isbn: formData.get('isbn') as string,
    description: formData.get('description') as string,
    user_id: formData.get('userId') ? parseInt(formData.get('userId') as string) : undefined
  };
  
  try {
    if (bookId) {
      await fetchAPI<Book>(`/books/update/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      });
      
      showToast('Book updated successfully', ToastType.SUCCESS);
    } else {
      await fetchAPI<Book>('/books/create_book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      });
      
      showToast('Book created successfully', ToastType.SUCCESS);
    }
    
    if (bookFormModal) bookFormModal.style.display = 'none';
    loadBooks();
  } catch (error) {
    console.error('Error saving book:', error);
    showToast('Error saving book', ToastType.ERROR);
  }
}

async function deleteBook(bookId: number): Promise<void> {
  try {
    await fetchAPI<null>(`/books/delete/${bookId}`, {
      method: 'DELETE'
    });
    
    showToast('Book deleted successfully', ToastType.SUCCESS);
    loadBooks();
  } catch (error) {
    console.error(`Error deleting book ${bookId}:`, error);
    showToast('Error deleting book', ToastType.ERROR);
  }
}

// ----- USERS PAGE -----
// DOM Elements for Users
const usersTable = document.getElementById('usersTable');
const loadingUsers = document.getElementById('loadingUsers');
const addUserBtn = document.getElementById('addUserBtn');
const userForm = document.getElementById('userForm') as HTMLFormElement;
const userFormModal = document.getElementById('userFormModal');
const cancelUserForm = document.getElementById('cancelUserForm');
const userFormTitle = document.getElementById('userFormTitle');

// Load Users
async function loadUsers(): Promise<void> {
  console.log('loadUsers function called');
  if (!loadingUsers || !usersTable) return;
  
  loadingUsers.style.display = 'block';
  
  const tbody = usersTable.querySelector('tbody');
  if (!tbody) {
    console.error('tbody element not found in usersTable');
    return;
  }
  
  tbody.innerHTML = '';
  
  try {
    console.log('Fetching users from API...');
    const data = await fetchAPI<User[]>('/users/all_users');
    
    loadingUsers.style.display = 'none';
    
    if (data && data.data) {
      displayUsers(data.data);
    } else {
      tbody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
    }
  } catch (error) {
    console.error("Error loading users:", error);
    loadingUsers.style.display = 'none';
    tbody.innerHTML = '<tr><td colspan="6">Error loading users. Please try again later.</td></tr>';
  }
}

// Display Users
function displayUsers(users: User[]): void {
  if (!usersTable) return;
  
  const tbody = usersTable.querySelector('tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  users.forEach(user => {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>${user.first_name || ''} ${user.last_name || ''}</td>
      <td><a href="books.html?user=${user.id}" class="action-btn">
          <ion-icon name="book-outline"></ion-icon> View Books
      </a></td>
      <td>
          <button class="action-btn edit-btn" data-action="edit" data-id="${user.id}">
              <ion-icon name="create-outline"></ion-icon> Edit
          </button>
          <button class="action-btn delete-btn" data-action="delete" data-id="${user.id}">
              <ion-icon name="trash-outline"></ion-icon> Delete
          </button>
      </td>
    `;
    
    tbody.appendChild(tr);
    
    const editBtn = tr.querySelector('.edit-btn') as HTMLElement;
    const deleteBtn = tr.querySelector('.delete-btn') as HTMLElement;
    
    editBtn?.addEventListener('click', () => {
      openUserFormModal(user.id);
    });
    
    deleteBtn?.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
        deleteUser(user.id);
      }
    });
  });
}

// Initialize User Form Events
function initUserFormEvents(): void {
  console.log('Initializing user form events');
  
  // Add click event for add user button
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      openUserFormModal();
    });
  }
  
  // Add submit event for user form
  if (userForm) {
    userForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleUserFormSubmit(e);
    });
  }
  
  // Add click event for cancel button
  if (cancelUserForm && userFormModal) {
    cancelUserForm.addEventListener('click', () => {
      userFormModal.style.display = 'none';
    });
  }
  
  // Add click event for close button
  const closeUserFormModalBtn = document.getElementById('closeUserFormModal');
  
  if (closeUserFormModalBtn && userFormModal) {
    closeUserFormModalBtn.addEventListener('click', () => {
      userFormModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e: MouseEvent) => {
    if (userFormModal && e.target === userFormModal) {
      userFormModal.style.display = 'none';
    }
  });
}

// Open User Form Modal
async function openUserFormModal(userId?: number): Promise<void> {
  if (!userFormModal || !userFormTitle) return;
  
  console.log('openUserFormModal called with userId:', userId);
  
  // Get form elements
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const emailInput = document.getElementById('userEmail') as HTMLInputElement;
  const passwordInput = document.getElementById('password') as HTMLInputElement;
  const firstNameInput = document.getElementById('firstName') as HTMLInputElement;
  const lastNameInput = document.getElementById('lastName') as HTMLInputElement;
  const userIdInput = document.getElementById('userId') as HTMLInputElement;
  const passwordField = document.querySelector('.password-field') as HTMLElement;
  
  // Reset the form
  if (userForm) userForm.reset();
  userIdInput.value = '';
  
  if (userId) {
    // Edit mode
    userFormTitle.textContent = 'Edit User';
    passwordField.style.display = 'block';
    passwordInput.required = false;
    
    try {
      console.log('Fetching user details for user ID:', userId);
      const data = await fetchAPI<User>(`/users/id/${userId}`);
      console.log('User details received:', data);
      
      if (data && data.data) {
        const user = data.data;
        
        // Populate the form
        userIdInput.value = user.id.toString();
        usernameInput.value = user.username || '';
        usernameInput.disabled = true; // Prevent username change
        emailInput.value = user.email || '';
        passwordInput.value = '';
        firstNameInput.value = user.first_name || '';
        lastNameInput.value = user.last_name || '';
      } else {
        console.error('No user data received');
        showToast('Failed to load user details', ToastType.ERROR);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showToast('Error loading user details', ToastType.ERROR);
    }
  } else {
    // Add mode
    console.log('Setting up form for adding a new user');
    userFormTitle.textContent = 'Add New User';
    passwordField.style.display = 'block';
    passwordInput.required = true;
    usernameInput.disabled = false;
  }
  
  // Show the modal
  console.log('Displaying user form modal');
  userFormModal.style.display = 'block';
}

// Handle User Form Submit
async function handleUserFormSubmit(e: Event): Promise<void> {
  e.preventDefault();
  if (!userForm || !userFormModal) return;
  
  console.log('Handling user form submit');
  
  const formData = new FormData(userForm);
  const userId = formData.get('userId') ? parseInt(formData.get('userId') as string) : null;
  
  console.log('Form data collected:', {
    userId,
    username: formData.get('username'),
    email: formData.get('email'),
    hasPassword: !!formData.get('password')
  });
  
  interface UserData {
    username: string;
    email: string;
    password?: string;
    first_name: string;
    last_name: string;
  }
  
  const userData: UserData = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string || undefined,
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string
  };
  
  try {
    if (userId) {
      // Update existing user
      console.log('Updating existing user ID:', userId);
      if (!userData.password) {
        console.log('No password provided, removing from update data');
        delete userData.password;
      }
      
      console.log('Sending update request with data:', userData);
      await fetchAPI<User>(`/users/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      showToast('User updated successfully', ToastType.SUCCESS);
    } else {
      // Create new user
      console.log('Creating new user with data:', userData);
      await fetchAPI<User>('/users/create_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      showToast('User created successfully', ToastType.SUCCESS);
    }
    
    // Close the modal and reload users
    userFormModal.style.display = 'none';
    loadUsers();
  } catch (error) {
    console.error('Error saving user:', error);
    showToast('Error saving user', ToastType.ERROR);
  }
}

// Delete User
async function deleteUser(userId: number): Promise<void> {
  try {
    // Updated endpoint to match backend
    await fetchAPI<null>(`/users/delete/${userId}`, {
      method: 'DELETE'
    });
    
    showToast('User deleted successfully', ToastType.SUCCESS);
    loadUsers();
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    showToast('Error deleting user. Please try again.', ToastType.ERROR);
  }
}

// ----- APP INITIALIZATION -----
document.addEventListener('DOMContentLoaded', () => {
  console.log('Book Catalog App initialized');
  initCommon();
  
  // Detect which page we're on and initialize accordingly
  const currentPath = window.location.pathname;
  
  if (currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/')) {
    console.log('Initializing home page');
    // Home page
    if (featuredBooks) {
      loadFeaturedBooks();
    }
    
    // Set up search functionality
    if (searchButton && searchInput) {
      searchButton.addEventListener('click', () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
          window.location.href = `books.html?search=${encodeURIComponent(searchTerm)}`;
        }
      });
      
      searchInput.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter' && searchButton) {
          searchButton.click();
        }
      });
    }
    
    // Set up modal close functionality
    const bookDetailModal = document.getElementById('bookDetailModal');
    const closeBookDetailModal = document.getElementById('closeBookDetailModal');
    
    if (closeBookDetailModal && bookDetailModal) {
      closeBookDetailModal.addEventListener('click', () => {
        bookDetailModal.style.display = 'none';
      });
    }
    
    window.addEventListener('click', (e: MouseEvent) => {
      if (bookDetailModal && e.target === bookDetailModal) {
        bookDetailModal.style.display = 'none';
      }
    });
    
  } else if (currentPath.includes('books.html')) {
    console.log('Initializing books page');
    // Books page
    
    // Get URL params
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const userIdParam = urlParams.get('user');
    
    if (searchParam) {
      currentFilters.searchTerm = searchParam;
      if (searchInput) searchInput.value = searchParam;
    }
    
    if (userIdParam) {
      // Load books by user
      // This would need a different endpoint or filter
    }
    
    if (addBookBtn) {
      addBookBtn.addEventListener('click', () => {
        openBookFormModal();
      });
    }
    
    if (bookForm) {
      bookForm.addEventListener('submit', handleBookFormSubmit);
    }
    
    if (cancelBookForm && bookFormModal) {
      cancelBookForm.addEventListener('click', () => {
        bookFormModal.style.display = 'none';
      });
    }
    
    const closeBookFormModal = document.getElementById('closeBookFormModal');
    if (closeBookFormModal && bookFormModal) {
      closeBookFormModal.addEventListener('click', () => {
        bookFormModal.style.display = 'none';
      });
    }
    
    if (filterButton && yearStartInput && yearEndInput) {
      filterButton.addEventListener('click', () => {
        const startYear = yearStartInput.value ? parseInt(yearStartInput.value) : undefined;
        const endYear = yearEndInput.value ? parseInt(yearEndInput.value) : undefined;
        
        currentFilters.startYear = startYear;
        currentFilters.endYear = endYear;
        
        loadBooks(1, booksPerPage, currentFilters);
      });
    }
    
    // Load books
    loadBooks();
    
  } else if (currentPath.includes('users.html')) {
    console.log('Initializing users page');
    // Users page
    initUserFormEvents();
    loadUsers();
  } else if (currentPath.includes('about.html')) {
    console.log('About page loaded');
    // About page has no special functionality
  }
});