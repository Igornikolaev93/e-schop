
        const API_URL = 'https://vue-study.skillbox.cc/api/products';
        let allProducts = [];
        let filteredProducts = [];
        let cartCount = 0;

        // ============================================================
        // 2. DOM-ссылки
        // ============================================================
        const grid = document.getElementById('productsGrid');
        const spinner = document.getElementById('spinner');
        const errorAlert = document.getElementById('errorAlert');
        const errorText = document.getElementById('errorText');
        const searchInput = document.getElementById('searchInput');
        const cartBadge = document.getElementById('cartCount');

        // ============================================================
        // 3. Загрузка товаров
        // ============================================================
        async function loadProducts() {
            errorAlert.style.display = 'none';
            spinner.style.display = 'flex';
            grid.innerHTML = '';

            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const data = await response.json();
                allProducts = data.items || [];
                filteredProducts = [...allProducts];
                renderProducts(filteredProducts);

            } catch (err) {
                console.error('Ошибка загрузки:', err);
                errorText.textContent = `Не удалось загрузить товары: ${err.message}`;
                errorAlert.style.display = 'flex';
            } finally {
                spinner.style.display = 'none';
            }
        }

        // ============================================================
        // 4. Отрисовка карточек
        // ============================================================
        function renderProducts(products) {
            if (!products || products.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column:1/-1; text-align:center; padding:40px 0; color:#888;">
                        <i class="fas fa-box-open fa-3x mb-3" style="display:block;"></i>
                        Товары не найдены
                    </div>
                `;
                return;
            }

            let html = '';
            for (const p of products) {
                const imageUrl = p.image?.file?.url || 'https://via.placeholder.com/300x300/eee/aaa?text=No+Image';
                const price = p.price ? p.price.toLocaleString('ru-RU') + ' ₽' : 'Цена не указана';

                // Цвета
                let colorsHtml = '';
                if (p.colors && p.colors.length) {
                    colorsHtml = p.colors.map(c =>
                        `<span class="color-dot" style="background:${c.code};" title="${c.title}"></span>`
                    ).join('');
                }

                html += `
                    <div class="product-card" onclick="openProduct(${p.id})">
                        <img src="${imageUrl}" alt="${p.title}" loading="lazy" />
                        <div class="name">${p.title}</div>
                        <div class="prices"><span class="current">${price}</span></div>
                        <div class="colors">${colorsHtml}</div>
                        <button class="btn-add" onclick="event.stopPropagation(); addToCart(${p.id})">
                            <i class="fas fa-cart-plus"></i> В корзину
                        </button>
                    </div>
                `;
            }

            grid.innerHTML = html;
        }

        // ============================================================
        // 5. Поиск
        // ============================================================
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            if (!query) {
                filteredProducts = [...allProducts];
            } else {
                filteredProducts = allProducts.filter(p =>
                    p.title.toLowerCase().includes(query)
                );
            }
            renderProducts(filteredProducts);
        });

        // ============================================================
        // 6. Корзина
        // ============================================================
        function addToCart(productId) {
            cartCount++;
            cartBadge.textContent = cartCount;

            // Показываем toast
            const toast = document.createElement('div');
            toast.className = 'custom-toast';
            toast.innerHTML = `<i class="fas fa-check-circle" style="color:#4caf50;"></i> Товар добавлен в корзину!`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s';
                setTimeout(() => toast.remove(), 400);
            }, 2000);
        }

        // ============================================================
        // 7. Модалка
        // ============================================================
        function openProduct(productId) {
            const product = allProducts.find(p => p.id === productId);
            if (!product) return;

            const imageUrl = product.image?.file?.url || 'https://via.placeholder.com/400x400/eee/aaa?text=No+Image';
            const price = product.price ? product.price.toLocaleString('ru-RU') + ' ₽' : 'Цена не указана';

            let colorsHtml = '';
            if (product.colors && product.colors.length) {
                colorsHtml = product.colors.map(c =>
                    `<span class="dot" style="background:${c.code};" title="${c.title}"></span>`
                ).join('');
            }

            const modalBody = document.getElementById('modalBody');
            modalBody.innerHTML = `
                <div class="row-modal">
                    <div class="col-img">
                        <img src="${imageUrl}" alt="${product.title}" />
                    </div>
                    <div class="col-info">
                        <h2>${product.title}</h2>
                        <div class="modal-price">${price}</div>
                        <div style="margin-bottom:8px;"><strong>Цвета:</strong></div>
                        <div class="modal-colors">${colorsHtml || '—'}</div>
                        <button class="btn-add-large" onclick="addToCart(${product.id}); closeModal();">
                            <i class="fas fa-cart-plus me-2"></i> Добавить в корзину
                        </button>
                        <button class="btn-add-large" style="background:#6c757d; margin-top:10px;" onclick="closeModal()">
                            Закрыть
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('productModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeModal(e) {
            if (e && e.target !== e.currentTarget) return;
            document.getElementById('productModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // ============================================================
        // 8. Старт
        // ============================================================
        document.addEventListener('DOMContentLoaded', loadProducts);