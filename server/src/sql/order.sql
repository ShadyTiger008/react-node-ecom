CREATE TABLE IF NOT EXISTS ecommerce.orders (
    orderID BIGINT AUTO_INCREMENT PRIMARY KEY,
    userID VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    subTotal DECIMAL(10, 2) NOT NULL,
    isDelivered BOOLEAN NOT NULL DEFAULT 0,
    isShipped BOOLEAN NOT NULL DEFAULT 0,
    isCancel BOOLEAN NOT NULL DEFAULT 0,
    isReturn BOOLEAN NOT NULL DEFAULT 0,
    returnReason VARCHAR(255) DEFAULT NULL,
    cancelReason VARCHAR(255) DEFAULT NULL,
    isPaid BOOLEAN NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 1,
    deliveryTime TIMESTAMP DEFAULT NULL,
    customerNumber BIGINT DEFAULT NULL,
    alternativePhoneNumber BIGINT DEFAULT NULL,
    customerAddress VARCHAR(255) DEFAULT NULL,
    trackingNumber VARCHAR(255) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paymentID INT NOT NULL,
    FOREIGN KEY (userID) REFERENCES ecommerce.users(userID) ON DELETE CASCADE,
    FOREIGN KEY (paymentID) REFERENCES payments(paymentID)
);