CREATE DATABASE  IF NOT EXISTS `modern_salon` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `modern_salon`;
-- MySQL dump 10.13  Distrib 8.0.28, for Win64 (x86_64)
--
-- Host: localhost    Database: modern_salon
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `branchName` varchar(45) NOT NULL,
  `branchCode` varchar(45) NOT NULL,
  `address` mediumtext NOT NULL,
  `contactNumber` varchar(45) NOT NULL,
  `createdBy` varchar(45) NOT NULL,
  `updatedBy` varchar(45) DEFAULT NULL,
  `createdDate` mediumtext,
  `updatedDate` mediumtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `branchesid_UNIQUE` (`id`),
  UNIQUE KEY `branchName_UNIQUE` (`branchName`),
  UNIQUE KEY `branchCode_UNIQUE` (`branchCode`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mapped_product`
--

DROP TABLE IF EXISTS `mapped_product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mapped_product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product` varchar(45) NOT NULL,
  `branch` varchar(45) NOT NULL,
  `mapDate` mediumtext NOT NULL,
  `createdBy` varchar(45) NOT NULL,
  `updatedBy` varchar(45) DEFAULT NULL,
  `unitPrice` float NOT NULL,
  `totalAmount` float NOT NULL,
  `quantity` int NOT NULL,
  `createdDate` mediumtext,
  `updatedDate` mediumtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `product_name_idx` (`product`),
  KEY `branch_mapped_idx` (`branch`),
  CONSTRAINT `branch_mapped` FOREIGN KEY (`branch`) REFERENCES `branches` (`branchName`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_mapped` FOREIGN KEY (`product`) REFERENCES `product` (`productName`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productName` varchar(45) NOT NULL,
  `productCode` varchar(45) NOT NULL,
  `productType` varchar(45) NOT NULL,
  `quantity` int NOT NULL,
  `createdBy` varchar(45) NOT NULL,
  `updatedBy` varchar(45) DEFAULT NULL,
  `productPrice` float NOT NULL,
  `mapped` tinyint DEFAULT '0',
  `updatedDate` mediumtext,
  `createdDate` mediumtext,
  PRIMARY KEY (`id`),
  UNIQUE KEY `productsId_UNIQUE` (`id`),
  UNIQUE KEY `productName_UNIQUE` (`productName`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-03-06 19:52:12
