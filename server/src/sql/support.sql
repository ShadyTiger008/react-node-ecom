CREATE TABLE IF NOT EXISTS ecommerce.supports(
    supportID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    subject VARCHAR(255) DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    userID VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    supportType VARCHAR(50) NOT NULL,
    userEmail VARCHAR(255) NOT NULL,
    userPhone VARCHAR(255) NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    Attachments TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
)