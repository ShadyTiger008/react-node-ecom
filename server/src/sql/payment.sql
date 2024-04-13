CREATE TABLE IF NOT EXISTS payments (
    paymentID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    paymentStatus VARCHAR(255) NOT NULL,
    paymentDate DATE NOT NULL,
    paymentAmount INT NOT NULL,
    paymentMethod VARCHAR(255) NOT NULL,
    paymentType VARCHAR(255) NOT NULL,
    paymentDescription VARCHAR(255) DEFAULT NULL,
    paymentCustomerID INT NOT NULL,
    FOREIGN KEY (paymentCustomerID) REFERENCES users(userID)
);