CREATE DATABASE IF NOT EXISTS taskflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskflow_db;


CREATE TABLE users (
    id                  INT             NOT NULL AUTO_INCREMENT,
    username            VARCHAR(50)     NOT NULL,
    email               VARCHAR(255)    NOT NULL,
    password_hash       VARCHAR(255)    NOT NULL,
    profile_picture_url VARCHAR(500)    DEFAULT NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_username UNIQUE (username),
    CONSTRAINT uq_email  UNIQUE (email)
);


CREATE TABLE tasks (
    id              INT             NOT NULL AUTO_INCREMENT,
    user_id         INT             NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    description_     TEXT            DEFAULT NULL,
    is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_tasks         PRIMARY KEY (id),
    CONSTRAINT fk_tasks_user    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE files (
    id                  INT             NOT NULL AUTO_INCREMENT,
    user_id             INT             NOT NULL,
    file_name           VARCHAR(255)    NOT NULL,
    file_type           VARCHAR(100)    NOT NULL,
    file_url            VARCHAR(500)    NOT NULL,
    uploaded_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_files         PRIMARY KEY (id),
    CONSTRAINT fk_files_user    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
