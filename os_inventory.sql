

CREATE TABLE tbl_roles (
    RoleId INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL
);


CREATE TABLE tbl_users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL ,
    Password VARCHAR(255) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    RoleId INT DEFAULT 2,
    FOREIGN KEY (RoleId) REFERENCES tbl_roles(RoleId)
);
ALTER
 TABLE tbl_users 
ADD COLUMN FailedAttempts INT DEFAULT 0,
ADD COLUMN LockoutEnd DATETIME NULL;

CREATE TABLE tbl_assets (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    CollCode VARCHAR(100),
    Name VARCHAR(255),
    Desc1 TEXT,
    AnDate DATE,
    PN VARCHAR(100),
    PAR VARCHAR(100),
    Qty INT,
    UM VARCHAR(50),
    UCost DECIMAL(18, 2),
    TCost DECIMAL(18, 2),
    UserName VARCHAR(100),
    Email VARCHAR(100),
    CurrentUser VARCHAR(100),
    EqStatus VARCHAR(100),
    SerialNumber VARCHAR(100),
    Location VARCHAR(100),
    Fund_Cluster VARCHAR(100),
    PPE VARCHAR(100),
    UserId Int ,
    FOREIGN KEY (UserId) REFERENCES tbl_Users(UserId)

);

CREATE TABLE tbl_tickets (
    TicketId INT AUTO_INCREMENT PRIMARY KEY,
    TicketNumber VARCHAR(255),
    PN VARCHAR(255),
    FullName VARCHAR(255),
    Email VARCHAR(255),
    RequestDate DATETIME,
    HelpTopic VARCHAR(100),
    IssueDesc VARCHAR(200),
    Location VARCHAR(255),
    PriorityLevel VARCHAR(50),
    CurrentStatus VARCHAR(100),
    LastUpdated DATETIME,
    DueDate DATETIME NULL,
    Overdue TINYINT(1),
    AgentAssigned VARCHAR(255) NULL,
    ReopenCount INT DEFAULT 0
);
ALTER TABLE tbl_tickets
ADD COLUMN FileName VARCHAR(255) NULL,
ADD COLUMN FileContentType VARCHAR(50) NULL;
ADD COLUMN ExtraFields JSON NULL;





CREATE TABLE log_transferasset (
    AuditId INT AUTO_INCREMENT PRIMARY KEY,
    Action VARCHAR(50) NOT NULL,
    PerformedBy VARCHAR(100) NOT NULL,
    PerformedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Details TEXT
);

CREATE TABLE log_user (
    AuditId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NULL,
    Email VARCHAR(100) NOT NULL,
    Action VARCHAR(50) NOT NULL,
    Details TEXT,
    PerformedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);







CREATE TABLE tbl_smtp_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    server VARCHAR(100),
    port INT,
    sender_name VARCHAR(100),
    sender_email VARCHAR(100),
    username VARCHAR(100),
    password VARCHAR(255),
    enable_ssl BOOLEAN
);

INSERT INTO tbl_smtp_settings
(server, port, sender_name, sender_email, username, password, enable_ssl)
VALUES
('smtp.gmail.com', 587, 'Help Desk Ticketing System', 
'jntulibao@up.edu.ph', 'jntulibao@up.edu.ph', 'udaobdqmzipgnbal', true);


CREATE TABLE tbl_googlelogin (
    SettingKey VARCHAR(100) PRIMARY KEY,
    SettingValue TEXT
);

INSERT INTO tbl_googlelogin (SettingKey, SettingValue)
VALUES ('google_client_id', '693611222238-rmrnu8v3j3cc5uj4k22sdsqgk6tkenr8.apps.googleusercontent.com');



CREATE TABLE tbl_email_verification (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255),
    OtpCode VARCHAR(10),
    Expiry DATETIME
);


CREATE TABLE tbl_activity_logs (
    LogId INT AUTO_INCREMENT PRIMARY KEY,

    -- Who did the action
    UserId INT NULL,
    UserEmail VARCHAR(255),

    -- What happened
    Module VARCHAR(100),      -- e.g. "USER", "TICKET", "ASSET", "ZOOM"
    Action VARCHAR(100),       -- e.g. "CREATE", "UPDATE", "DELETE", "LOGIN", "TRANSFER"

    -- Optional reference IDs
    ReferenceId VARCHAR(100),  -- TicketId, AssetId, UserId, etc.

    -- Details
    Description TEXT,

    -- When
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE tbl_password_reset (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255),
    ResetToken VARCHAR(255),
    Expiry DATETIME,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
