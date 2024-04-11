CREATE TABLE IF NOT EXISTS products (
    productID VARCHAR(255) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    subcategory VARCHAR(255) NOT NULL,
    sizes ENUM('xs', 's', 'm', 'l', 'xl', '2xl', '3xl') NOT NULL,
    colors VARCHAR(255) NOT NULL DEFAULT 'white',
    ratings DECIMAL(3, 2) DEFAULT 0,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP DEFAULT NULL
);
