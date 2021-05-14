--- load with 
--- psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f schema.sql
DROP TABLE IF EXISTS ftdstats;
DROP TABLE IF EXISTS ftduser;

CREATE TABLE ftduser (
	username VARCHAR(20) PRIMARY KEY,
	password BYTEA NOT NULL,
	email VARCHAR(256) NOT NULL CHECK (LENGTH(email)>=3), 
    phone VARCHAR(256) NOT NULL CHECK (LENGTH(phone)=12), 
    birthday DATE NOT NULL, 
	level VARCHAR(256) NOT NULL CHECK(level = 'easy' OR level = 'medium' OR level = 'hard'), 
    privacy BOOLEAN NOT NULL CHECK(privacy = TRUE)
);

CREATE TABLE ftdstats (
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	username VARCHAR(20),
	level VARCHAR(256) NOT NULL CHECK(level = 'easy' OR level = 'medium' OR level = 'hard'),
	score INTEGER NOT NULL CHECK (score>=0),
	enemies INTEGER NOT NULL CHECK (enemies>=0),
	PRIMARY KEY(created_at, username)
);

--- Could have also stored as 128 character hex encoded values
--- select char_length(encode(sha512('abc'), 'hex')); --- returns 128
INSERT INTO ftduser VALUES('user1', sha512('password1'),'me@email.com','000-000-0000','2021-03-13','easy',TRUE);
INSERT INTO ftduser VALUES('user2', sha512('password2'),'me@email.com','000-000-0000','2021-03-13','easy',TRUE);
