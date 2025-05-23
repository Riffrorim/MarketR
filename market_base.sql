CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255),
  name VARCHAR(100),
  password TEXT,
  cash INT DEFAULT 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description MEDIUMTEXT,
  price INT,
  photo VARCHAR(255),
  user_id VARCHAR(255),
  creator_name VARCHAR(100),
  sold BOOLEAN DEFAULT FALSE,
  sold_at TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  buyer_id VARCHAR(255),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  price INT,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
) ENGINE=InnoDB;