CREATE TABLE IF NOT EXISTS users (
        id BIGINT NOT NULL AUTO_INCREMENT,
        userID VARCHAR(255) NOT NULL PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        gender VARCHAR(50) DEFAULT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(255) DEFAULT NULL,
        city VARCHAR(50) NULL,
        state VARCHAR(50) DEFAULT NULL,
        zip VARCHAR(50) DEFAULT NULL,
        otp: VARCHAR(10) DEFAULT NULL,
        isVerified BOOLEAN NOT NULL DEFAULT 0,
        otpVerified BOOLEAN NOT NULL DEFAULT 0,
        profileImage: VARCHAR(255) DEFAULT NULL,
        refreshToken: VARCHAR(255) DEFAULT NULL,
    ) AUTO_INCREMENT = 1 DEFAULT CHARSET = UTF8MB4 COLLATE = UTF8MB4_UNICODE_CI;