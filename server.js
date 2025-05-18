const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const mysql = require("mysql2");
const multer = require('multer');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/addProduct.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'addProduct.html'));
});
const con = mysql.createConnection({
  host: process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQLDATABASE || "yourdb",
  port: process.env.MYSQLPORT || 3306
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'market_uploads',
    format: async (req, file) => 'webp',
    transformation: [{ width: 800, crop: 'scale' }],
  },
});

const upload = multer({ storage });
//Регистрация
app.post("/saveNamePassword", (req, res) => {
    const { id, name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ error: "Имя и пароль обязательны" });
    }

    const checkQuery = "SELECT * FROM users WHERE name = ?";

    con.query(checkQuery, [name], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Пользователь с таким именем уже существует" });
        }

        const query = "INSERT INTO users (id, name, password) VALUES (?, ?, ?)";

        con.query(query, [id, name, password], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Ошибка базы данных" });
            }
            res.status(200).json({ success: true });
        });
    });
});
//Вход
app.post("/checkNamePassword", (req, res) => {
    const { name, password } = req.body;
    
    if (!name || !password) {
        return res.status(400).json({ error: "Имя и пароль обязательны" });
    }

    const getQuery = "SELECT id, name FROM users WHERE name = ? AND password = ?";
    con.query(getQuery, [name, password], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        if (result.length === 0) {
            return res.status(401).json({ error: "Неверное имя пользователя или пароль" });
        }
        res.status(200).json({ 
            success: true,
            userId: result[0].id,
            username: result[0].name
        });
    });
});
//Добавление данных товара в базу данных
app.post("/productData", upload.array('photos', 5), async (req, res) => {
  const { nameProduct, description, price, user_id } = req.body;

  try {
    const photoUrls = await Promise.all(
      req.files.map(file => 
        cloudinary.uploader.upload(file.path).then(result => result.secure_url)
      )
    );
    const insertQuery = `
      INSERT INTO products (name, description, price, photo, user_id, creator_name) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    con.query(insertQuery, [
      nameProduct, 
      description, 
      price, 
      photoUrls.join(','),
      user_id,
      creatorName
    ], (err, result) => {
      if (err) throw err;
      res.status(200).json({ success: true });
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка загрузки изображений" });
  }
});

const photoUrls = await Promise.all(uploadImages);
const photoPaths = photoUrls.join(',');

    const insertQuery = "INSERT INTO products (name, description, price, photo, user_id, creator_name) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(insertQuery, [nameProduct, description, price, photoPaths, user_id, creatorName], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Ошибка базы данных при добавлении товара" });
      }
      res.status(200).json({ success: true });
    });
  });
});
//Получение списка товаров на главной странице
app.get("/getProducts", (req, res) => {
    const query = "SELECT *, TIMESTAMPDIFF(MINUTE, sold_at, NOW()) as minutes_since_sale FROM products WHERE sold_at IS NULL OR TIMESTAMPDIFF(MINUTE, sold_at, NOW()) < 1440";
    con.query(query, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        res.status(200).json(results);
    });
});
// Получение данных одного товара для подробного отображения
app.get("/getProduct/:id", (req, res) => {
    const productId = req.params.id;
    const query = "SELECT * FROM products WHERE id = ?";
    con.query(query, [productId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: "Товар не найден" });
        }
        res.status(200).json(result[0]);
    });
});
// Получение данных пользователя для профиля
app.get("/getUserData", (req, res) => {
    const userId = req.query.id;
    
    if (!userId) {
        return res.status(400).json({ error: "ID пользователя обязательно" });
    }

    const query = "SELECT name FROM users WHERE id = ?";
    con.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        
        res.status(200).json({
            name: result[0].name
        });
    });
});

// Получение количества товаров пользователя
app.get("/getUserProductsCount", (req, res) => {
    const userId = req.query.user_id;
    
    if (!userId) {
        return res.status(400).json({ error: "ID пользователя обязательно" });
    }

    const query = "SELECT COUNT(*) as count FROM products WHERE user_id = ?";
    con.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        res.status(200).json({
            count: result[0].count
        });
    });
});
// Изменение имени пользователя
app.post("/changeUsername", (req, res) => {
    const { userId, newUsername } = req.body;
    
    if (!userId || !newUsername) {
        return res.status(400).json({ error: "ID пользователя и новое имя обязательны" });
    }
    const checkQuery = "SELECT * FROM users WHERE name = ? AND id != ?";
    con.query(checkQuery, [newUsername, userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: "Пользователь с таким именем уже существует" });
        }
        const updateQuery = "UPDATE users SET name = ? WHERE id = ?";
        con.query(updateQuery, [newUsername, userId], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Ошибка базы данных" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Пользователь не найден" });
            }
            const updateProductsQuery = "UPDATE products SET creator_name = ? WHERE user_id = ?";
            con.query(updateProductsQuery, [newUsername, userId], (err, productResult) => {
                if (err) {
                    console.error("Database error:", err);
                }
                
                res.status(200).json({ success: true });
            });
        });
    });
});
// Получение баланса пользователя
app.get("/getUserBalance", (req, res) => {
    const userId = req.query.user_id;
    
    if (!userId) {
        return res.status(400).json({ error: "ID пользователя обязательно" });
    }

    const query = "SELECT cash as balance FROM users WHERE id = ?";
    con.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        if (result.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        
        res.status(200).json({
            balance: result[0].balance
        });
    });
});

// Пополнение баланса
app.post("/refillBalance", (req, res) => {
    const { user_id, amount } = req.body;
    
    if (!user_id || !amount || amount <= 0) {
        return res.status(400).json({ error: "Некорректные данные" });
    }

    const query = "UPDATE users SET cash = cash + ? WHERE id = ?";
    con.query(query, [amount, user_id], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        
        res.status(200).json({ success: true });
    });
});

// Обработка покупки товара
app.post("/purchaseProduct", (req, res) => {
    const { product_id, buyer_id, price } = req.body;
    
    if (!product_id || !buyer_id || !price) {
        return res.status(400).json({ error: "Недостаточно данных для покупки" });
    }

    // Проверка баланса покупателя
    const checkBalanceQuery = "SELECT cash FROM users WHERE id = ?";
    con.query(checkBalanceQuery, [buyer_id], (err, balanceResult) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        if (balanceResult.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        
        const userBalance = balanceResult[0].cash;
        if (userBalance < price) {
            return res.status(400).json({ error: "Недостаточно средств на балансе" });
        }
        const checkOwnerQuery = "SELECT user_id FROM products WHERE id = ? AND sold_at IS NULL";
        con.query(checkOwnerQuery, [product_id], (err, ownerResult) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Ошибка базы данных" });
            }
            
            if (ownerResult.length === 0) {
                return res.status(404).json({ error: "Товар не найден или уже продан" });
            }
            
            const owner_id = ownerResult[0].user_id;
            if (owner_id === buyer_id) {
                return res.status(400).json({ error: "Нельзя купить собственный товар" });
            }

            // транзакция
            con.beginTransaction(err => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Ошибка базы данных" });
                }

                // Списываем деньги у покупателя
                const deductQuery = "UPDATE users SET cash = cash - ? WHERE id = ?";
                con.query(deductQuery, [price, buyer_id], (err, deductResult) => {
                    if (err) {
                        return con.rollback(() => {
                            console.error("Database error:", err);
                            res.status(500).json({ error: "Ошибка базы данных" });
                        });
                    }

                    // Зачисляем деньги продавцу
                    const addQuery = "UPDATE users SET cash = cash + ? WHERE id = ?";
                    con.query(addQuery, [price, owner_id], (err, addResult) => {
                        if (err) {
                            return con.rollback(() => {
                                console.error("Database error:", err);
                                res.status(500).json({ error: "Ошибка базы данных" });
                            });
                        }

                        // Записываем время продажи
                        const markSoldQuery = "UPDATE products SET sold_at = CURRENT_TIMESTAMP WHERE id = ?";
                        con.query(markSoldQuery, [product_id], (err, markResult) => {
                            if (err) {
                                return con.rollback(() => {
                                    console.error("Database error:", err);
                                    res.status(500).json({ error: "Ошибка базы данных" });
                                });
                            }

                            // Записываем покупку в историю
                            const purchaseQuery = "INSERT INTO purchases (product_id, buyer_id, price) VALUES (?, ?, ?)";
                            con.query(purchaseQuery, [product_id, buyer_id, price], (err, purchaseResult) => {
                                if (err) {
                                    return con.rollback(() => {
                                        console.error("Database error:", err);
                                        res.status(500).json({ error: "Ошибка базы данных" });
                                    });
                                }
                                con.commit(err => {
                                    if (err) {
                                        return con.rollback(() => {
                                            console.error("Database error:", err);
                                            res.status(500).json({ error: "Ошибка базы данных" });
                                        });
                                    }

                                    res.status(200).json({ success: true });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
// получение истории покупок
app.get("/getUserPurchases", (req, res) => {
    const userId = req.query.user_id;
    
    if (!userId) {
        return res.status(400).json({ error: "ID пользователя обязательно" });
    }

    const query = `
    SELECT p.id as purchase_id, p.product_id, pr.name as product_name, 
           pr.price, p.purchase_date 
    FROM purchases p
    JOIN products pr ON p.product_id = pr.id
    WHERE p.buyer_id = ?
    ORDER BY p.purchase_date DESC
`;
    
    con.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        res.status(200).json(results);
    });
});
// Получение количества проданных товаров пользователя
app.get("/getUserSoldProductsCount", (req, res) => {
    const userId = req.query.user_id;
    
    if (!userId) {
        return res.status(400).json({ error: "ID пользователя обязательно" });
    }

    const query = "SELECT COUNT(*) as count FROM products WHERE user_id = ? AND sold_at IS NOT NULL";
    con.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        res.status(200).json({
            count: result[0].count
        });
    });
});

// Получение количества приобретённых товаров пользователя
app.get("/getUserPurchasesCount", (req, res) => {
    const userId = req.query.user_id;
    
    if (!userId) {
        return res.status(400).json({ error: "ID пользователя обязательно" });
    }

    const query = "SELECT COUNT(*) as count FROM purchases WHERE buyer_id = ?";
    con.query(query, [userId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        res.status(200).json({
            count: result[0].count
        });
    });
});

// Получение списка проданных товаров пользователя
app.get("/getUserSoldProducts", (req, res) => {
    const userId = req.query.user_id;
    
    if (!userId) {
        return res.status(400).json({ error: "ID пользователя обязательно" });
    }

    const query = `
        SELECT p.id, p.name, p.price, p.sold_at, 
               u.name as buyer_name
        FROM products p
        LEFT JOIN purchases pu ON p.id = pu.product_id
        LEFT JOIN users u ON pu.buyer_id = u.id
        WHERE p.user_id = ? AND p.sold_at IS NOT NULL
        ORDER BY p.sold_at DESC
    `;
    
    con.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        res.status(200).json(results);
    });
});
// Эндпоинт для поисковой строки
app.get("/searchProducts", (req, res) => {
    const searchTerm = req.query.term;
    
    if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
    }

    const query = `
        SELECT *, TIMESTAMPDIFF(MINUTE, sold_at, NOW()) as minutes_since_sale 
        FROM products 
        WHERE (sold_at IS NULL OR TIMESTAMPDIFF(MINUTE, sold_at, NOW()) < 1440)
        AND (name LIKE ? OR description LIKE ?)
    `;
    
    const searchPattern = `%${searchTerm}%`;
    
    con.query(query, [searchPattern, searchPattern], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        res.status(200).json(results);
    });
});
con.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    return;
  }
  console.log('Подключение к базе данных — успешно');

  const sqlScript = fs.readFileSync(path.join(__dirname, 'market_base.sql'), 'utf8');
  const queries = sqlScript.split(';').filter(q => q.trim() !== '');

  let completed = 0;
  queries.forEach(query => {
    con.query(query + ';', (err) => {
      if (err) {
        console.error('Ошибка при выполнении запроса:', err);
      } else {
        completed++;
      }
      if (completed === queries.length) {
        app.listen(3000, () => {
          console.log('Сервер запущен: http://localhost:3000');
        });
      }
    });
  });
});
