CREATE DATABASE electrondb;

USE electrondb;

CREATE TABLE product(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  price DECIMAL(7,3) NOT NULL
);

DESCRIBE product;

-- to change decimal range value
-- ALTER TABLE 'price' CHANGE COLUMN 'price' DECIMAL(8,2)

CREATE TABLE `modern_salon`.`product` (
  `productId` INT NOT NULL,
  `productName` VARCHAR(45) NOT NULL,
  `productCode` VARCHAR(45) NOT NULL,
  `productType` VARCHAR(45) NOT NULL,
  `quantity` INT NOT NULL,
  `createdBy` VARCHAR(45) NOT NULL,
  `createdDate` DATE NOT NULL,
  `updatedBy` VARCHAR(45) NULL,
  `updatedDate` VARCHAR(45) NULL,
  PRIMARY KEY (`productId`),
  UNIQUE INDEX `productsId_UNIQUE` (`productId` ASC) VISIBLE);

  CREATE TABLE `modern_salon`.`branches` (
  `branchId` INT NOT NULL,
  `branchName` VARCHAR(45) NOT NULL,
  `branchCode` VARCHAR(45) NOT NULL,
  `address` MEDIUMTEXT NOT NULL,
  `contactNumber` VARCHAR(45) NOT NULL,
  `createdBy` VARCHAR(45) NOT NULL,
  `createdDate` VARCHAR(45) NOT NULL,
  `updatedBy` VARCHAR(45) NULL,
  `updatedDate` VARCHAR(45) NULL,
  PRIMARY KEY (`branchId`),
  UNIQUE INDEX `branchesid_UNIQUE` (`branchId` ASC) VISIBLE);