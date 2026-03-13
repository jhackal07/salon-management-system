
CREATE TABLE users (
 id SERIAL PRIMARY KEY,
 name VARCHAR(100),
 email VARCHAR(100),
 password VARCHAR(200),
 role VARCHAR(20)
);

CREATE TABLE services (
 id SERIAL PRIMARY KEY,
 name VARCHAR(100),
 description TEXT,
 price FLOAT,
 duration INT
);

CREATE TABLE appointments (
 id SERIAL PRIMARY KEY,
 user_id INT,
 service_id INT,
 date TIMESTAMP,
 status VARCHAR(20)
);
