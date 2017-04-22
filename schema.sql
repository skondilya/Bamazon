create database Bamazon;

use Bamazon;

CREATE TABLE products (
item_id INTEGER(11) NOT NULL AUTO_INCREMENT,
product_name VARCHAR (50) NULL,
department_name VARCHAR (50) NULL,
price DECIMAL (10,2) NULL,
Stock_quantity INTEGER (11) NULL,
product_sales DECIMAL (10,2) NULL
PRIMARY KEY (item_id)
);

use Bamazon;

CREATE TABLE departments (
item_id INTEGER(11) NOT NULL AUTO_INCREMENT,
department_name VARCHAR (200) NULL,
over_head_costs  INTEGER (11) NULL,
total_sales INTEGER (11) NULL,
PRIMARY KEY (item_id)
);
