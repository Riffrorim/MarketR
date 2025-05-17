document.addEventListener('DOMContentLoaded', function() {
    const productId = new URLSearchParams(window.location.search).get('id');
    const userId = localStorage.getItem('userId');
    
    // Загружаем данные о товаре
    fetch(`/getProduct/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Товар не найден');
            }
            return response.json();
        })
        .then(product => {
            document.getElementById('productTitle').textContent = product.name;
            document.getElementById('productDescription').textContent = product.description;
            document.getElementById('productPrice').textContent = `${product.price}₽`;
            document.getElementById('user').textContent = product.creator_name;
            
            // Обработка изображений товара
            const imageContainer = document.getElementById('productImages');
            imageContainer.innerHTML = '';
            product.photo.split(',').forEach(photoUrl => {
                const img = document.createElement('img');
                img.src = photoUrl.trim();
                img.className = 'img-product';
                imageContainer.appendChild(img);
            });
            const buyButton = document.getElementById('buy');
            const soldImg = document.getElementById('soldImg');
            const soldText = document.getElementById('soldText');
            if (product.sold_at) {
                buyButton.style.display = 'none';
                soldImg.style.display = 'block';
                soldText.style.display = 'block';
            } else if (product.user_id === userId) {
                buyButton.style.display = 'none';
                soldImg.style.display = 'none';
                soldText.style.display = 'none';
            } else {
                buyButton.style.display = 'block';
                soldImg.style.display = 'none';
                soldText.style.display = 'none';
                buyButton.addEventListener('click', function() {
                    if (!userId) {
                        showError('Для покупки товара необходимо авторизоваться');
                        return;
                    }
                    
                    fetch('/purchaseProduct', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            product_id: productId,
                            buyer_id: userId,
                            price: product.price
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
                        window.location.reload();
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showError(error.error || 'Ошибка при покупке товара');
                    });
                });
            }
            checkAuthState();
            displayUsername();
        })
        .catch(error => {
            console.error('Error:', error);
            showError(error.message || 'Произошла ошибка при загрузке товара');
            window.location.href = '/';
        });
});

// Функции для работы с аутентификацией
function displayUsername() {
    const username = localStorage.getItem('username');
    const usernameElement = document.getElementById('name');
    if (username && usernameElement) {
        usernameElement.textContent = username;
    }
}

function checkAuthState() {
    const username = localStorage.getItem('username');
    const taskbar = document.getElementById('taskbar');
    const guestContainer = document.querySelector('.guest');

    if (username) {
        if (taskbar) taskbar.style.display = 'flex';
        if (guestContainer) guestContainer.style.display = 'none';
    } else {
        if (taskbar) taskbar.style.display = 'none';
        if (guestContainer) guestContainer.style.display = 'flex';
    }
}
