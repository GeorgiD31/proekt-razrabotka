CREATE DATABASE	gosho;
use gosho;
CREATE TABLE `UsersTable` (
    `UserId` int auto_increment NOT NULL ,
    `UserName` varchar(32)  NOT NULL ,
    `HashedPassword` varchar(64)  NOT NULL ,
    `Email` varchar(50)  NOT NULL ,
    `Name` varchar(50)  NOT NULL ,
    PRIMARY KEY (
        `UserId`
    )
);

CREATE TABLE `messages` (
	`MsgId` int auto_increment NOT NULL,
    `Msg` varchar(500)  NOT NULL ,
    `Sender_id` int  NOT NULL ,
    `Receiver_id` int  NOT NULL ,
    primary key (
		`MsgId`
	)
);

ALTER TABLE `messages` ADD CONSTRAINT `fk_messages_Sender_id` FOREIGN KEY(`Sender_id`)
REFERENCES `UsersTable` (`UserId`);

ALTER TABLE `messages` ADD CONSTRAINT `fk_messages_Receiver_id` FOREIGN KEY(`Receiver_id`)
REFERENCES `UsersTable` (`UserId`);

INSERT INTO UsersTable (UserName, HashedPassword, Email, Name) VALUES
    ('user1', 'hashed_password1', 'user1@example.com', 'John Doe'),
    ('user2', 'hashed_password2', 'user2@example.com', 'Jane Smith'),
    ('user3', 'hashed_password3', 'user3@example.com', 'Bob Johnson'),
    ('user4', 'hashed_password4', 'user4@example.com', 'Alice Williams'),
    ('user5', 'hashed_password5', 'user5@example.com', 'Charlie Brown');

