-- Creating tables
CREATE TABLE names (
	member_id SERIAL PRIMARY KEY,
  	member_first_name TEXT,
  	member_middle_name TEXT,
  	member_last_name TEXT
);

CREATE TABLE nicknames (
	nickname_id SERIAL PRIMARY KEY,
  	member_id INT,
  	nickname TEXT,
  	FOREIGN KEY (member_id) REFERENCES names (member_id)
);

CREATE TABLE birthdays (
	birthday_id SERIAL PRIMARY KEY,
  	member_id INT,
  	birthday DATE,
  	birth_place TEXT,
  	FOREIGN KEY (member_id) REFERENCES names (member_id)
);

-- Inserting data
INSERT INTO names (member_first_name, member_middle_name, member_last_name)
VALUES 
('Isabelle', 'My Nhan', 'Phan'),
('Matthew', 'Minh Nhat', 'Phan'),
('Natalie', 'Diem Mi', 'Phan'),
('Jamie', 'Nhat Minh', 'Phan');

INSERT INTO birthdays (member_id, birthday, birth_place)
VALUES
(1, '2004-01-23', 'Kensington'),
(2, '2000-02-06', 'Wandsworth'),
(3, '2001-05-21', 'Wandsworth'),
(4, '2005-10-13', 'Wandsworth');

INSERT INTO nicknames (member_id, nickname)
VALUES
(2, 'Matt');

