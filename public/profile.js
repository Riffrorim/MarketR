DOMContentLoaded:
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
    loadProfileData();
    setupChangeName();
    setupRefillBalance();
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            changeNameUser();
        }
    });
    document.getElementById('change-name-block').addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
function loadProfileData() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        showError('Пользователь не авторизован');
        window.location.href = '/';
        return;
    }

    fetch(`/getUserData?id=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки данных пользователя');
            }
            return response.json();
        })
        .then(userData => {
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = userData.name;
            }
            loadUserBalance();
            
            // Загружаем количество добавленных товаров
            fetch(`/getUserProductsCount?user_id=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки количества товаров');
                    }
                    return response.json();
                })
                .then(data => {
                    const addedProductsCount = document.getElementById('added-products-count');
                    if (addedProductsCount) {
                        addedProductsCount.textContent = `Добавленные товары: ${data.count}`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            // Загружаем количество проданных товаров
            fetch(`/getUserSoldProductsCount?user_id=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки количества проданных товаров');
                    }
                    return response.json();
                })
                .then(data => {
                    const soldProductsCount = document.getElementById('sold-products-count');
                    if (soldProductsCount) {
                        soldProductsCount.textContent = `Проданные товары: ${data.count}`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            // Загружаем количество приобретённых товаров
            fetch(`/getUserPurchasesCount?user_id=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки количества покупок');
                    }
                    return response.json();
                })
                .then(data => {
                    const purchasedProductsCount = document.getElementById('purchased-products-count');
                    if (purchasedProductsCount) {
                        purchasedProductsCount.textContent = `Приобретённые товары: ${data.count}`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });

            // Загружаем список проданных товаров
            fetch(`/getUserSoldProducts?user_id=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки проданных товаров');
                    }
                    return response.json();
                })
.then(soldProducts => {
    const soldProductsContainer = document.getElementById('sold-products-container');
    if (soldProductsContainer) {
        soldProductsContainer.innerHTML = '';
        
        if (soldProducts.length === 0) {
            soldProductsContainer.innerHTML = '<p class="no-items">Нет проданных товаров</p>';
        } else {
            soldProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'purchase';
                productDiv.innerHTML = `
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">${product.price}₽</p>
                    <p class="sold-date">Продано: ${new Date(product.sold_at).toLocaleDateString()}</p>
                    <button class="view" data-product-id="${product.id}">Посмотреть</button>
                `;
                soldProductsContainer.appendChild(productDiv);
            });
            document.querySelectorAll('#sold-products-container .view').forEach(button => {
                button.addEventListener('click', function(e) {
                    const productId = e.target.getAttribute('data-product-id');
                    window.location.href = `product-details.html?id=${productId}`;
                });
            });
        }
    }
})
                .catch(error => {
                    console.error('Error:', error);
                });

            // Загружаем историю покупок
            fetch(`/getUserPurchases?user_id=${userId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Ошибка загрузки истории покупок');
                    }
                    return response.json();
                })
.then(purchases => {
    const purchaseContainer = document.getElementById('purchase-container');
    if (purchaseContainer) {
        purchaseContainer.innerHTML = '';
        
        if (purchases.length === 0) {
            purchaseContainer.innerHTML = '<p class="no-items">Нет купленных товаров</p>';
        } else {
            purchases.forEach(purchase => {
                const purchaseDiv = document.createElement('div');
                purchaseDiv.className = 'purchase';
                purchaseDiv.innerHTML = `
                    <p class="nameProduct">${purchase.product_name}</p>
                    <p class="date">Куплено: ${new Date(purchase.purchase_date).toLocaleDateString()}</p>
                    <p class="price">${purchase.price}₽</p>
                    <button class="view" data-product-id="${purchase.product_id}">Посмотреть</button>
                `;
                purchaseContainer.appendChild(purchaseDiv);
            });
            document.querySelectorAll('#purchase-container .view').forEach(button => {
                button.addEventListener('click', function(e) {
                    const productId = e.target.getAttribute('data-product-id');
                    window.location.href = `product-details.html?id=${productId}`;
                });
            });
        }
    }
})
       .catch(error => {
           console.error('Error:', error);
       });
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Не удалось загрузить данные профиля');
            window.location.href = '/';
        });
        loadUserProducts();
}
const changeName = document.getElementById('change-name');
const changeNameBlock = document.getElementById('change-name-block');
changeName.addEventListener("click", changeNameUser);
let flagName = true;
function changeNameUser(){
    const modalOverlay = document.getElementById('modal-overlay');
    if(flagName === true){
        modalOverlay.style.display = "flex";
        changeNameBlock.style.display = "flex";
        flagName = false;
    }
    else {
        modalOverlay.style.display = "none";
        changeNameBlock.style.display = "none";
        flagName = true;
    }
}

function setupChangeName() {
    const changeButton = document.getElementById('change');
    if (changeButton) {
        changeButton.addEventListener('click', changeUsername);
    }
}

function changeUsername() {
    const newUsername = document.getElementById('new-username-input').value.trim();
    const userId = localStorage.getItem('userId');
    
    if (!newUsername) {
        showError('Введите новое имя пользователя');
        return;
    }
    
    if (!userId) {
        showError('Пользователь не авторизован');
        window.location.href = '/';
        return;
    }

    fetch('/changeUsername', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: userId,
            newUsername: newUsername
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        showSuccess('Имя пользователя успешно изменено!');
        localStorage.setItem('username', newUsername);
        document.getElementById('current-username').textContent = newUsername;
        document.getElementById('username-display').textContent = newUsername;
        document.getElementById('modal-overlay').style.display = 'none';
        document.getElementById('change-name-block').style.display = 'none';
        flagName = true;
        if (window.opener) {
            window.opener.postMessage({
                type: 'usernameChanged',
                newUsername: newUsername
            }, '*');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.error || 'Ошибка при изменении имени пользователя');
    });
}
window.addEventListener('message', function(event) {
    if (event.data.type === 'usernameChanged') {
        localStorage.setItem('username', event.data.newUsername);
        const usernameElements = document.querySelectorAll('#username-display, #current-username');
        usernameElements.forEach(el => {
            el.textContent = event.data.newUsername;
        });
    }
});
//Открытие окна с пополнением денег
const openRefill = document.getElementById('open-refill');
const refillContainer = document.getElementById('refill-container');
openRefill.addEventListener("click", refillCashUser);
let flagCash = true;
function refillCashUser(){
    if(flagCash === true){
        refillContainer.style.display = "flex";
        flagCash = false;
    }
    else if(flagCash === false){
        refillContainer.style.display = "none";
        flagCash = true;
    }
}
// Функция для загрузки баланса пользователя
function loadUserBalance() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    fetch(`/getUserBalance?user_id=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки баланса');
            }
            return response.json();
        })
        .then(data => {
            const cashElement = document.getElementById('cash');
            if (cashElement) {
                cashElement.textContent = `Кошелёк: ${data.balance}₽`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function setupRefillBalance() {
    const refillButton = document.querySelector('.refill');
    if (refillButton) {
        refillButton.addEventListener('click', function() {
            const amount = document.getElementById('input-cash').value;
            const userId = localStorage.getItem('userId');

            if (!amount || isNaN(amount)) {
                showError('Введите корректную сумму');
                return;
            }

            fetch('/refillBalance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    amount: parseInt(amount)
                })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(() => {
                showSuccess('Баланс успешно пополнен!');
                document.getElementById('input-cash').value = '';
                document.getElementById('refill-container').style.display = 'none';
                flagCash = true;
                loadUserBalance();
            })
            .catch(error => {
                console.error('Error:', error);
                showError(error.error || 'Ошибка при пополнении баланса');
            });
        });
    }
}
function loadUserProducts() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    fetch(`/getUserProducts?user_id=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки товаров пользователя');
            }
            return response.json();
        })
        .then(products => {
            const container = document.getElementById('my-products-container');
            container.innerHTML = '';
            
            if (products.length === 0) {
                container.innerHTML = '<p class="no-items">Нет добавленных товаров</p>';
                return;
            }

            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <p class="product-name">${product.name}</p>
                    <p class="product-price">${product.price}₽</p>
                    <div class="buttons-container">
                        <button class="delete" data-product-id="${product.id}">Удалить</button>
                        <button class="view" data-product-id="${product.id}">Посмотреть</button>
                    </div>
                `;
                container.appendChild(productDiv);
            });
            document.querySelectorAll('.delete').forEach(button => {
                button.addEventListener('click', function(e) {
                    const productId = e.target.getAttribute('data-product-id');
                    deleteProduct(productId);
                });
            });
            document.querySelectorAll('.view').forEach(button => {
                button.addEventListener('click', function(e) {
                    const productId = e.target.getAttribute('data-product-id');
                    window.location.href = `product-details.html?id=${productId}`;
                });
            });
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Не удалось загрузить ваши товары');
        });
}

// Функция для удаления товара
function deleteProduct(productId) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

    fetch('/deleteProduct', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            product_id: productId,
            user_id: localStorage.getItem('userId')
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(() => {
        showSuccess('Товар успешно удалён!');
        loadUserProducts();
        if (window.opener) {
            window.opener.postMessage({
                type: 'productDeleted',
                productId: productId
            }, '*');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(error.error || 'Ошибка при удалении товара');
    });
}
window.addEventListener('message', function(event) {
    if (event.data.type === 'purchaseMade') {
        loadProfileData();
    }
});
window.addEventListener('message', function(event) {
    if (event.data.type === 'productDeleted') {
        loadUserProducts();
    }
});