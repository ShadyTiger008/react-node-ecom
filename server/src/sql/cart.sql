CREATE TABLE IF NOT EXISTS carts (
    cartID VARCHAR(255) NOT NULL PRIMARY KEY,
    productID VARCHAR(255) NOT NULL,
    userID VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    variantID VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productID) REFERENCES products(productID),
    FOREIGN KEY (userID) REFERENCES users(userID)
) DEFAULT CHARSET = UTF8MB4 COLLATE = UTF8MB4_UNICODE_CI;