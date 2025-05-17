//Открытие модальных окон
const LogIn = document.getElementById('LogInBtn');
const modalOverlay = document.getElementById('modal-overlay');
const logInModalWindow = document.getElementById('logIn-modal-window');
const registrModalWindow = document.getElementById('registr-modal-window');
const showRegistrButtons = document.querySelectorAll('#showRegistr');
const showLoginButtons = document.querySelectorAll('#showLogin, .ShowLogin');
const usernameElement = document.getElementById("name");
const taskbar = document.getElementById("taskbar");

function toggleModal() {
    if (!logInModalWindow || !modalOverlay) return;

    const isModalVisible = modalOverlay.classList.contains('active');
    
    if (isModalVisible) {
        closeModal();
    } else {
        openModal('login');
    }
}

function openModal(type) {
    modalOverlay.classList.add('active');
    if (type === 'login') {
        logInModalWindow.style.display = 'block';
        registrModalWindow.style.display = 'none';
        document.querySelectorAll('.lever button').forEach(button => {
            button.classList.remove('active');
            if (button.textContent.trim() === 'Вход') {
                button.classList.add('active');
            }
        });
    } else {
        logInModalWindow.style.display = 'none';
        registrModalWindow.style.display = 'block';
        document.querySelectorAll('.lever button').forEach(button => {
            button.classList.remove('active');
            if (button.textContent.trim() === 'Регистрация') {
                button.classList.add('active');
            }
        });
    }
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

// Обработчики для кнопок
showRegistrButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lever button').forEach(button => {
            button.classList.remove('active');
        });
        e.target.classList.add('active');
        openModal('register');
    });
});

showLoginButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.lever button').forEach(button => {
            button.classList.remove('active');
        });
        e.target.classList.add('active');
        openModal('login');
    });
});

if (LogIn) {
    LogIn.addEventListener('click', toggleModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

//Регистрация
const inputName = document.getElementById("inputNameReg");
const inputPassword = document.getElementById("inputPasswordReg");
const regButton = document.getElementById("reg");

function registr(){
    if (inputName.value.trim() === "" && inputPassword.value.trim() === "") {
        showError("Введите имя и пароль");
        return;
    }
    else if (inputPassword.value.trim() === "") {
        showError("Введите пароль");
        return;
    }
    else if (inputName.value.trim() === "") {
        showError("Введите свое имя");
        return;
    }
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    fetch("/saveNamePassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            id: id,
            name: inputName.value, 
            password: inputPassword.value 
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(
        () => {
            localStorage.setItem("userId", id)
            localStorage.setItem('username', inputName.value);
            displayUsername();
            inputName.value = "";
            inputPassword.value = "";
            showSuccess("Регистрация успешна!");
            closeModal();
            taskbar.style.display = "flex";
            document.querySelector('.guest').style.display = 'none';
        }
    )
    .catch(error => {
        console.error("Ошибка: ", error);
        showError(error.error || "Ошибка регистрации");
    });
}
regButton.addEventListener("click", registr);

document.addEventListener('DOMContentLoaded', displayUsername);

//Вход
const inputNameLog = document.getElementById("inputNameLogin");
const inputPasswordLog = document.getElementById("inputPasswordLogin");
const logInButton = document.getElementById("logInButton");

function logInSystem() {
    if (inputNameLog.value.trim() === "" && inputPasswordLog.value.trim() === "") {
        showError("Введите имя и пароль");
        return;
    }
    else if (inputPasswordLog.value.trim() === "") {
        showError("Введите пароль");
        return;
    }
    else if (inputNameLog.value.trim() === "") {
        showError("Введите свое имя");
        return;
    }

    fetch("/checkNamePassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            name: inputNameLog.value, 
            password: inputPasswordLog.value 
        }),
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        displayUsername();
        inputNameLog.value = "";
        inputPasswordLog.value = "";
        showSuccess("Вход произошёл успешно!");
        closeModal();
        taskbar.style.display = "flex";
        document.querySelector('.guest').style.display = 'none';
    })
    .catch(error => {
        console.error("Error:", error);
        showError(error.error || "Ошибка выполнения запроса");
    });
}

logInButton.addEventListener("click", logInSystem);

//выход
document.addEventListener('DOMContentLoaded', function() {
    displayUsername();
    checkAuthState();
});

//Открытие окна добавления продуктов
const productContainer = document.getElementById("product-container");
const addProduct = document.getElementById("addProduct");
const addProductContainer = document.getElementById("add-product-container");
let flag = true;

function toProductPage(){
    productContainer.style.display = "none";
    addProductContainer.style.display = "flex";
    addProduct.innerText = "Отмена добавления товара"
    flag = false;
}

function toMainPage(){
    productContainer.style.display = "flex";
    addProductContainer.style.display = "none";
    addProduct.innerText = "Добавить товар";
    flag = true;
}

addProduct.addEventListener("click", () => {
    if(flag === true){
        toProductPage();
    }
    else if(flag === false){
        toMainPage();
    }
});

// Добавление фотографий товара
const addPhotoImg = document.getElementById("addPhotoImg");
const fotoInput = document.getElementById("fotoInput");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");

addPhotoImg.addEventListener("click", function() {
    fotoInput.click();
});

fotoInput.addEventListener("change", function(event) {
    const files = event.target.files;
    imagePreviewContainer.innerHTML = "";
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.match("image.*")) {
            continue;
        }
        const imgPreview = document.createElement("img");
        imgPreview.className = "img-product";
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
        imagePreviewContainer.appendChild(imgPreview);
    }
});

//Добавление продукта
const nameProduct = document.getElementById('name-product');
const description = document.getElementById('description');
const price = document.getElementById('price');
const complete = document.getElementById('complete');

complete.addEventListener('click', productToMainPage);

function productToMainPage() {
  const formData = new FormData();
  const files = fotoInput.files;
  const userId = localStorage.getItem('userId');

  if (!nameProduct.value || !description.value || !price.value || files.length === 0 || !userId) {
    showError("Введите данные товара");
    return;
  }

  formData.append('nameProduct', nameProduct.value);
  formData.append('description', description.value);
  formData.append('price', price.value);
  formData.append('user_id', userId);
  
  for (let i = 0; i < files.length; i++) {
    formData.append('photos', files[i]);
  }

  fetch("/productData", {
    method: "POST",
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(err => { throw err; });
    }
    return response.json();
  })
  .then(() => {
    showSuccess('Добавление товара произошло успешно');
    nameProduct.value = "";
    description.value = "";
    price.value = "";
    imagePreviewContainer.innerHTML = "";
    fotoInput.value = "";
    toMainPage();
    loadProducts();
  })
  .catch(error => {
    console.error("Error:", error);
    showError(error.error || "Ошибка добавления товара");
  });
}

//Загрузка и отображение товаров
function loadProducts() {
    fetch("/getProducts")
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки товаров");
            }
            return response.json();
        })
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error("Error:", error);
            showError("Ошибка загрузки товаров");
        });
}

setInterval(loadProducts, 60000);

// Загружаем товары при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    displayUsername();
    checkAuthState();
    loadProducts();
});

//Перенаправление в профиль пользователя
document.addEventListener('DOMContentLoaded', function() {
    const profileButtons = document.querySelectorAll('header button:first-child');
    profileButtons.forEach(button => {
        if (button.textContent.trim() === 'Профиль') {
            button.addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
        }
    });
});

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Функция для обработки поиска
function handleSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm === '') {
        loadProducts();
        return;
    }
    if(!flag){
        toMainPage();
    }
    fetch(`/searchProducts?term=${encodeURIComponent(searchTerm)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка поиска товаров");
            }
            return response.json();
        })
        .then(products => {
            displayProducts(products);
        })
        .catch(error => {
            console.error("Error:", error);
            showError("Ошибка при поиске товаров");
        });
}

//Функция для отображения продуктов
function displayProducts(products) {
    const productContainer = document.getElementById("product-container");
    productContainer.innerHTML = "";
    
    if (products.length === 0) {
        productContainer.innerHTML = '<p class="no-results">Товары не найдены</p>';
        return;
    }

    products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.className = "product";
        
        const isSold = product.sold_at !== null;
        const minutesLeft = isSold ? Math.max(0, 1440 - product.minutes_since_sale) : 0;
        
        productDiv.innerHTML = `
            <div>
                <p class="nameProduct">${product.name}</p>
            </div>
            <div class="img-product-container">
                ${product.photo.split(',').map(photo => 
                    `<img src="${photo.trim()}" class="img-product" style="max-width: calc(100% - 10px);">`
                ).join('')}
            </div>
            <div>
                <p>Цена: ${product.price}₽</p>
            </div>
            <div class="actions">
                ${isSold 
                    ? `<img src="buy.png" class="buy"><p>Продано</p> <button class="details-btn" data-product-id="${product.id}">Подробнее</button>` 
                    : product.user_id === localStorage.getItem('userId')
                        ? `<button class="details-btn" data-product-id="${product.id}">Подробнее</button>`
                        : `<button class="buy-btn" data-product-id="${product.id}" data-price="${product.price}">Купить</button>
                           <button class="details-btn" data-product-id="${product.id}">Подробнее</button>`
                }
            </div>
        `;
        productContainer.appendChild(productDiv);
    });

    document.querySelectorAll('.details-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const productId = e.target.getAttribute('data-product-id');
            window.location.href = `product-details.html?id=${productId}`;
        });
    });

    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const userId = localStorage.getItem('userId');
            if (!userId) {
                showError('Для покупки товара необходимо авторизоваться');
                return;
            }

            const productId = e.target.getAttribute('data-product-id');
            const price = e.target.getAttribute('data-price');
            
            fetch('/purchaseProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    product_id: productId,
                    buyer_id: userId,
                    price: price
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(() => {
                showSuccess('Покупка прошла успешно!');
                loadProducts();
            })
            .catch(error => {
                console.error('Error:', error);
                showError(error.error || 'Ошибка при покупке товара');
            });
        });
    });
}
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keyup', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});
document.querySelectorAll('.descriptionInput').forEach(el => {
  el.addEventListener('input', () => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  });
});