// Types and Interfaces
interface Book {
  id: number;
  title: string;
  author: string;
  publication_year: number;
  isbn: string;
  description?: string;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  meta?: PaginationMeta;
}

interface BookFilters {
  searchTerm?: string;
  startYear?: number;
  endYear?: number;
}

enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

enum PageType {
  HOME = 'home',
  BOOKS = 'books',
  USERS = 'users',
  ABOUT = 'about'
}

// API Base URL
const API_BASE_URL: string = 'http://localhost:3000';

// DOM Elements
const mainContent: HTMLElement = document.getElementById('mainContent')!;
const navLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('nav a[data-page]');
const footerLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('footer a[data-page]');
const menuToggle: HTMLElement = document.getElementById('menuToggle')!;
const navMenu: HTMLElement = document.getElementById('navMenu')!;
const searchInput: HTMLInputElement = document.getElementById('searchInput') as HTMLInputElement;
const searchButton: HTMLElement = document.getElementById('searchButton')!;
const addBookBtn: HTMLElement = document.getElementById('addBookBtn')!;
const addUserBtn: HTMLElement = document.getElementById('addUserBtn')!;
const featuredBooks: HTMLElement = document.getElementById('featuredBooks')!;
const booksGrid: HTMLElement = document.getElementById('booksGrid')!;
const usersTable: HTMLElement = document.getElementById('usersTable')!;
const booksPagination: HTMLElement = document.getElementById('booksPagination')!;

// Modals
const bookDetailModal: HTMLElement = document.getElementById('bookDetailModal')!;
const bookFormModal: HTMLElement = document.getElementById('bookFormModal')!;
const userFormModal: HTMLElement = document.getElementById('userFormModal')!;
const closeBookDetailModal: HTMLElement = document.getElementById('closeBookDetailModal')!;
const closeBookFormModal: HTMLElement = document.getElementById('closeBookFormModal')!;
const closeUserFormModal: HTMLElement = document.getElementById('closeUserFormModal')!;

// Forms
const bookForm: HTMLFormElement = document.getElementById('bookForm') as HTMLFormElement;
const userForm: HTMLFormElement = document.getElementById('userForm') as HTMLFormElement;
const cancelBookForm: HTMLElement = document.getElementById('cancelBookForm')!;
const cancelUserForm: HTMLElement = document.getElementById('cancelUserForm')!;

// Statistics
const totalBooksElement: HTMLElement = document.getElementById('totalBooks')!;
const totalUsersElement: HTMLElement = document.getElementById('totalUsers')!;
const popularAuthorElement: HTMLElement = document.getElementById('popularAuthor')!;

// Current Page State
let currentPage: PageType = PageType.HOME;
let booksCurrentPage: number = 1;
let booksPerPage: number = 10;
let totalBooksCount: number = 0;
let currentBookFilters: BookFilters = {};

// ===== Event Listeners =====

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page as PageType;
        navigateToPage(page);
    });
});

footerLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page as PageType;
        navigateToPage(page);
    });
});

// Menu Toggle for Mobile
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Search Functionality
searchButton.addEventListener('click', () => {
    const searchTerm: string = searchInput.value.trim();
    if (searchTerm) {
        navigateToPage(PageType.BOOKS);
        searchBooks(searchTerm);
    }
});

searchInput.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

// Book Filtering
document.getElementById('filterButton')!.addEventListener('click', () => {
    const startYearInput = document.getElementById('yearStart') as HTMLInputElement;
    const endYearInput = document.getElementById('yearEnd') as HTMLInputElement;
    const startYear = startYearInput.value;
    const endYear = endYearInput.value;
    
    currentBookFilters = {};
    
    if (startYear) currentBookFilters.startYear = parseInt(startYear);
    if (endYear) currentBookFilters.endYear = parseInt(endYear);
    
    loadBooks(1, booksPerPage, currentBookFilters);
});

// Modal Closers
closeBookDetailModal.addEventListener('click', () => {
    bookDetailModal.style.display = 'none';
});

closeBookFormModal.addEventListener('click', () => {
    bookFormModal.style.display = 'none';
});

closeUserFormModal.addEventListener('click', () => {
    userFormModal.style.display = 'none';
});

// Add Book/User Buttons
addBookBtn.addEventListener('click', () => {
    openBookFormModal();
});

addUserBtn.addEventListener('click', () => {
    openUserFormModal();
});

// Form Cancel Buttons
cancelBookForm.addEventListener('click', () => {
    bookFormModal.style.display = 'none';
});

cancelUserForm.addEventListener('click', () => {
    userFormModal.style.display = 'none';
});

// Form Submissions
bookForm.addEventListener('submit', handleBookFormSubmit);
userForm.addEventListener('submit', handleUserFormSubmit);

// Close modals when clicking outside
window.addEventListener('click', (e: MouseEvent) => {
    if (e.target === bookDetailModal) bookDetailModal.style.display = 'none';
    if (e.target === bookFormModal) bookFormModal.style.display = 'none';
    if (e.target === userFormModal) userFormModal.style.display = 'none';
});

// ===== Functions =====

// Navigation
function navigateToPage(page: PageType): void {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`${page}Page`)!.classList.add('active');
    
    // Update active nav link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu if open
    navMenu.classList.remove('active');
    
    // Load page content
    if (page === PageType.HOME) {
        loadFeaturedBooks();
        loadStatistics();
    } else if (page === PageType.BOOKS) {
        loadBooks(1, booksPerPage);
    } else if (page === PageType.USERS) {
        loadUsers();
    }
    
    // Update current page
    currentPage = page;
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// API Calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T> | null> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json() as ApiResponse<T>;
        
        if (!response.ok) {
            throw new Error(data.message || 'An error occurred');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        if (error instanceof Error) {
            showToast(error.message, ToastType.ERROR);
        } else {
            showToast('An unknown error occurred', ToastType.ERROR);
        }
        return null;
    }
}

// Load Books
async function loadBooks(page: number = 1, limit: number = 10, filters: BookFilters = {}): Promise<void> {
    booksGrid.innerHTML = '<div class="loading">Loading books...</div>';
    
    let queryParams = `page=${page}&limit=${limit}`;
    
    // Add filters if present
    if (filters.searchTerm) queryParams += `&searchTerm=${encodeURIComponent(filters.searchTerm)}`;
    if (filters.startYear) queryParams += `&startYear=${filters.startYear}`;
    if (filters.endYear) queryParams += `&endYear=${filters.endYear}`;
    
    const data = await fetchAPI<Book[]>(`/books?${queryParams}`);
    
    if (data && data.data) {
        displayBooks(data.data);
        if (data.meta) {
            updatePagination(data.meta);
            booksCurrentPage = page;
            totalBooksCount = data.meta.total;
        }
    } else {
        booksGrid.innerHTML = '<p>No books found</p>';
        booksPagination.innerHTML = '';
    }
}

// Search Books
function searchBooks(term: string): void {
    currentBookFilters = { searchTerm: term };
    loadBooks(1, booksPerPage, currentBookFilters);
    
    // Update search input in books page
    searchInput.value = term;
}

// Display Books in Grid
function displayBooks(books: Book[]): void {
    if (!books || books.length === 0) {
        booksGrid.innerHTML = '<p>No books found</p>';
        return;
    }
    
    booksGrid.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        // Generate a random color for book cover if no image
        const randomColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
        
        bookCard.innerHTML = `
            <div class="book-card-img" style="background-color: ${randomColor}">
                <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: rgba(0,0,0,0.2);">
                    <ion-icon name="book-outline"></ion-icon>
                </div>
            </div>
            <div class="book-card-content">
                <h3>${book.title}</h3>
                <p><strong>By:</strong> ${book.author}</p>
                <div class="book-info">
                    <span class="year">${book.publication_year}</span>
                    <button class="view-btn" data-id="${book.id}">
                        <ion-icon name="eye-outline"></ion-icon> View Details
                    </button>
                </div>
            </div>
        `;
        
        booksGrid.appendChild(bookCard);
        
        // Add event listener to view button
        const viewBtn = bookCard.querySelector('.view-btn') as HTMLElement;
        viewBtn.addEventListener('click', () => {
            openBookDetailModal(book.id);
        });
    });
}

// Update Pagination
function updatePagination(meta: PaginationMeta): void {
    booksPagination.innerHTML = '';
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '« Previous';
    prevBtn.disabled = meta.page <= 1;
    if (meta.page > 1) {
        prevBtn.addEventListener('click', () => {
            loadBooks(meta.page - 1, meta.limit, currentBookFilters);
        });
    }
    booksPagination.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, meta.page - 2);
    const endPage = Math.min(meta.totalPages, meta.page + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i.toString();
        if (i === meta.page) {
            pageBtn.classList.add('active');
        } else {
            pageBtn.addEventListener('click', () => {
                loadBooks(i, meta.limit, currentBookFilters);
            });
        }
        booksPagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next »';
    nextBtn.disabled = meta.page >= meta.totalPages;
    if (meta.page < meta.totalPages) {
        nextBtn.addEventListener('click', () => {
            loadBooks(meta.page + 1, meta.limit, currentBookFilters);
        });
    }
    booksPagination.appendChild(nextBtn);
}

// Load Featured Books
async function loadFeaturedBooks(): Promise<void> {
    featuredBooks.innerHTML = '<div class="loading">Loading featured books...</div>';
    
    const data = await fetchAPI<Book[]>('/books?limit=4');
    
    if (data && data.data) {
        displayFeaturedBooks(data.data);
    } else {
        featuredBooks.innerHTML = '<p>No featured books found</p>';
    }
}

// Display Featured Books
function displayFeaturedBooks(books: Book[]): void {
    if (!books || books.length === 0) {
        featuredBooks.innerHTML = '<p>No featured books found</p>';
        return;
    }
    
    featuredBooks.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        
        // Generate a random color for book cover
        const randomColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
        
        bookCard.innerHTML = `
            <div class="book-card-img" style="background-color: ${randomColor}">
                <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: rgba(0,0,0,0.2);">
                    📚
                </div>
            </div>
            <div class="book-card-content">
                <h3>${book.title}</h3>
                <p><strong>By:</strong> ${book.author}</p>
                <div class="book-info">
                    <span class="year">${book.publication_year}</span>
                    <button class="view-btn" data-id="${book.id}">View Details</button>
                </div>
            </div>
        `;
        
        featuredBooks.appendChild(bookCard);
        
        // Add event listener to view button
        const viewBtn = bookCard.querySelector('.view-btn') as HTMLElement;
        viewBtn.addEventListener('click', () => {
            openBookDetailModal(book.id);
        });
    });
}

// Load Users
async function loadUsers(): Promise<void> {
    const loadingElement = document.getElementById('loadingUsers')!;
    loadingElement.style.display = 'block';
    
    const tbody = usersTable.querySelector('tbody')!;
    tbody.innerHTML = '';
    
    const data = await fetchAPI<User[]>('/users');
    
    loadingElement.style.display = 'none';
    
    if (data && data.data) {
        displayUsers(data.data);
    } else {
        tbody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
    }
}

// Display Users
function displayUsers(users: User[]): void {
    const tbody = usersTable.querySelector('tbody')!;
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.first_name || ''} ${user.last_name || ''}</td>
            <td><button class="action-btn" data-action="books" data-id="${user.id}">View Books</button></td>
            <td>
                <button class="action-btn edit-btn" data-action="edit" data-id="${user.id}">Edit</button>
                <button class="action-btn delete-btn" data-action="delete" data-id="${user.id}">Delete</button>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Add event listeners to buttons
        tr.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const action = target.dataset.action;
                const userId = parseInt(target.dataset.id || '0');
                
                if (action === 'books') {
                    navigateToPage(PageType.BOOKS);
                    loadUserBooks(userId);
                } else if (action === 'edit') {
                    openUserFormModal(userId);
                } else if (action === 'delete') {
                    deleteUser(userId);
                }
            });
        });
    });
}

// Load Statistics
async function loadStatistics(): Promise<void> {
    // Book count
    const booksData = await fetchAPI<Book[]>('/books?limit=1');
    if (booksData && booksData.meta) {
        totalBooksElement.textContent = booksData.meta.total.toString();
    } else {
        totalBooksElement.textContent = '0';
    }
    
    // User count
    const usersData = await fetchAPI<User[]>('/users');
    if (usersData && usersData.data) {
        totalUsersElement.textContent = usersData.data.length.toString();
    } else {
        totalUsersElement.textContent = '0';
    }
    
    // Popular author (we'll use books data to calculate)
    const allBooksData = await fetchAPI<Book[]>('/books');
    if (allBooksData && allBooksData.data && allBooksData.data.length > 0) {
        const authors: Record<string, number> = {};
        
        allBooksData.data.forEach(book => {
            if (!authors[book.author]) {
                authors[book.author] = 0;
            }
            authors[book.author]++;
        });
        
        let popularAuthor = '';
        let maxBooks = 0;
        
        for (const author in authors) {
            if (authors[author] > maxBooks) {
                popularAuthor = author;
                maxBooks = authors[author];
            }
        }
        
        popularAuthorElement.textContent = popularAuthor;
    } else {
        popularAuthorElement.textContent = 'None';
    }
}

// Load User Books
async function loadUserBooks(userId: number): Promise<void> {
    const data = await fetchAPI<Book[]>(`/books/user/${userId}`);
    
    if (data && data.data) {
        displayBooks(data.data);
        // Hide pagination since we're showing all books for a user
        booksPagination.innerHTML = '';
    } else {
        booksGrid.innerHTML = '<p>No books found for this user</p>';
        booksPagination.innerHTML = '';
    }
}

// Open Book Detail Modal
async function openBookDetailModal(bookId: number): Promise<void> {
    const bookDetailContent = document.getElementById('bookDetailContent')!;
    bookDetailContent.innerHTML = '<div class="loading">Loading book details...</div>';
    
    bookDetailModal.style.display = 'block';
    
    const data = await fetchAPI<Book>(`/books/${bookId}`);
    
    if (data && data.data) {
        const book = data.data;
        
        // Generate a random color for book cover
        const randomColor = `hsl(${Math.random() * 360}, 70%, 80%)`;
        
        bookDetailContent.innerHTML = `
            <div class="book-detail-header">
                <div class="book-detail-img" style="background-color: ${randomColor}">
                    <div style="height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: rgba(0,0,0,0.2);">
                        📚
                    </div>
                </div>
                <div class="book-detail-title">
                    <h2>${book.title}</h2>
                    <p><strong>By:</strong> ${book.author}</p>
                    <p><strong>Year:</strong> ${book.publication_year}</p>
                    <p><strong>ISBN:</strong> ${book.isbn}</p>
                </div>
            </div>
            
            <div class="book-detail-info">
                <p><strong>Description:</strong></p>
                <p>${book.description || 'No description available.'}</p>
            </div>
            
            <div class="book-detail-actions">
                <button class="btn secondary-btn edit-book-btn" data-id="${book.id}">Edit Book</button>
                <button class="btn cancel-btn delete-book-btn" data-id="${book.id}">Delete Book</button>
            </div>
        `;
        
        // Add event listeners
        const editBtn = bookDetailContent.querySelector('.edit-book-btn') as HTMLElement;
        const deleteBtn = bookDetailContent.querySelector('.delete-book-btn') as HTMLElement;
        
        editBtn.addEventListener('click', () => {
            bookDetailModal.style.display = 'none';
            openBookFormModal(book.id);
        });
        
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
                deleteBook(book.id);
            }
        });
    } else {
        bookDetailContent.innerHTML = '<p>Failed to load book details</p>';
    }
}

// Open Book Form Modal
async function openBookFormModal(bookId?: number): Promise<void> {
    const bookFormTitle = document.getElementById('bookFormTitle')!;
    
    // Reset form
    bookForm.reset();
    document.getElementById('bookId')!.setAttribute('value', '');
    
    if (bookId) {
        // Edit mode
        bookFormTitle.textContent = 'Edit Book';
        
        const data = await fetchAPI<Book>(`/books/${bookId}`);
        
        if (data && data.data) {
            const book = data.data;
            
            document.getElementById('bookId')!.setAttribute('value', book.id.toString());
            (document.getElementById('title') as HTMLInputElement).value = book.title;
            (document.getElementById('author') as HTMLInputElement).value = book.author;
            (document.getElementById('publicationYear') as HTMLInputElement).value = book.publication_year.toString();
            (document.getElementById('isbn') as HTMLInputElement).value = book.isbn;
            (document.getElementById('description') as HTMLTextAreaElement).value = book.description || '';
        } else {
            showToast('Failed to load book details', ToastType.ERROR);
            return;
        }
    } else {
        // Add mode
        bookFormTitle.textContent = 'Add New Book';
    }
    
    bookFormModal.style.display = 'block';
}

// Open User Form Modal
async function openUserFormModal(userId?: number): Promise<void> {
    const userFormTitle = document.getElementById('userFormTitle')!;
    const passwordField = document.querySelector('.password-field')!;
    const passwordHint = document.getElementById('passwordHint')!;
    
    // Reset form
    userForm.reset();
    document.getElementById('userId')!.setAttribute('value', '');
    
    if (userId) {
        // Edit mode
        userFormTitle.textContent = 'Edit User';
        passwordHint.style.display = 'block';
        
        const data = await fetchAPI<User>(`/users/${userId}`);
        
        if (data && data.data) {
            const user = data.data;
            
            document.getElementById('userId')!.setAttribute('value', user.id.toString());
            (document.getElementById('username') as HTMLInputElement).value = user.username;
            (document.getElementById('userEmail') as HTMLInputElement).value = user.email;
            (document.getElementById('firstName') as HTMLInputElement).value = user.first_name || '';
            (document.getElementById('lastName') as HTMLInputElement).value = user.last_name || '';
        } else {
            showToast('Failed to load user details', ToastType.ERROR);
            return;
        }
    } else {
        // Add mode
        userFormTitle.textContent = 'Add New User';
        passwordHint.style.display = 'none';
    }
    
    userFormModal.style.display = 'block';
}

// Handle Book Form Submit
async function handleBookFormSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    const bookId = (document.getElementById('bookId') as HTMLInputElement).value;
    
    const formData = new FormData(bookForm);
    const bookData: Record<string, string> = {};
    
    formData.forEach((value, key) => {
        bookData[key] = value.toString();
    });
    
    if (bookId) {
        // Update book
        const response = await fetchAPI<Book>(`/books/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        
        if (response) {
            showToast('Book updated successfully', ToastType.SUCCESS);
            bookFormModal.style.display = 'none';
            
            // Reload current view
            if (currentPage === PageType.BOOKS) {
                loadBooks(booksCurrentPage, booksPerPage, currentBookFilters);
            } else if (currentPage === PageType.HOME) {
                loadFeaturedBooks();
            }
        }
    } else {
        // Create book
        const response = await fetchAPI<Book>('/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });
        
        if (response) {
            showToast('Book created successfully', ToastType.SUCCESS);
            bookFormModal.style.display = 'none';
            
            // Reload current view
            if (currentPage === PageType.BOOKS) {
                loadBooks(1, booksPerPage);
            } else if (currentPage === PageType.HOME) {
                loadFeaturedBooks();
            }
        }
    }
}

// Handle User Form Submit
async function handleUserFormSubmit(e: Event): Promise<void> {
    e.preventDefault();
    
    const userId = (document.getElementById('userId') as HTMLInputElement).value;
    
    const formData = new FormData(userForm);
    const userData: Record<string, string> = {};
    
    formData.forEach((value, key) => {
        if (value || key !== 'password') {
            userData[key] = value.toString();
        }
    });
    
    if (userId) {
        // Update user - don't send empty password
        if (!userData.password) {
            delete userData.password;
        }
        
        const response = await fetchAPI<User>(`/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response) {
            showToast('User updated successfully', ToastType.SUCCESS);
            userFormModal.style.display = 'none';
            
            // Reload users if on users page
            if (currentPage === PageType.USERS) {
                loadUsers();
            }
        }
    } else {
        // Create user
        const response = await fetchAPI<User>('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (response) {
            showToast('User created successfully', ToastType.SUCCESS);
            userFormModal.style.display = 'none';
            
            // Reload users if on users page
            if (currentPage === PageType.USERS) {
                loadUsers();
            }
        }
    }
}

// Delete Book
async function deleteBook(bookId: number): Promise<void> {
    const response = await fetchAPI<null>(`/books/${bookId}`, {
        method: 'DELETE'
    });
    
    if (response) {
        showToast('Book deleted successfully', ToastType.SUCCESS);
        
        // Close modal if open
        bookDetailModal.style.display = 'none';
        
        // Reload current view
        if (currentPage === PageType.BOOKS) {
            loadBooks(booksCurrentPage, booksPerPage, currentBookFilters);
        } else if (currentPage === PageType.HOME) {
            loadFeaturedBooks();
            loadStatistics();
        }
    }
}

// Delete User
async function deleteUser(userId: number): Promise<void> {
    if (confirm('Are you sure you want to delete this user? All associated books will become unassigned.')) {
        const response = await fetchAPI<null>(`/users/${userId}`, {
            method: 'DELETE'
        });
        
        if (response) {
            showToast('User deleted successfully', ToastType.SUCCESS);
            
            // Reload users
            loadUsers();
            
            // Reload statistics if on home page
            if (currentPage === PageType.HOME) {
                loadStatistics();
            }
        }
    }
}

// Show Toast
function showToast(message: string, type: ToastType = ToastType.INFO): void {
    const toastContainer = document.getElementById('toastContainer')!;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    navigateToPage(PageType.HOME);
});