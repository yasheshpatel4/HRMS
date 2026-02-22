 # HRMS - Human Resource Management System

## 🎯 Overview

HRMS is an enterprise-grade Human Resource Management System designed to streamline internal HR operations and enhance employee engagement. The system manages travel planning, expense tracking, employee achievements, recreational activities, organizational hierarchy visualization, and job referrals in one unified platform.

**Key Highlights:**
- 🔐 Secure role-based access control (Employee, Manager, HR Admin)
- 📧 Automated email notifications
- 📱 Responsive React + TypeScript frontend
- ⚡ Robust Spring Boot REST API
- 🗄️ SQL Server enterprise database

---

## ✨ Key Features

 1. Travel & Expense Management
 2. Social Achievements & Celebrations
 3. Games Scheduling & Fairness
 4. Organization Chart
 5. Job Listings & Referrals

---

### Prerequisites

**Frontend:**
- Node.js 14+ and npm/yarn

**Backend:**
- Java Development Kit(jdk) 9 or higher
- Maven 3.6+

**Database:**
- SQL Server 2019 or higher
- SQL Server Management Studio (SSMS) or similar

---

### 1. Repository Setup
```
bash
git clone https://github.com/yasheshpatel4/HRMS
cd HRMS
```

### 2. Backend Configuration (Spring Boot)
Update `src/main/resources/application.properties` with these settings:
```
properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=hrms_db;trustServerCertificate=true
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
```

Run the server:
```bash
mvn clean install
mvn spring-boot:run
```

### 3. Frontend Configuration (React + Vite)
```
bash
cd hrms_frontend
npm install
npm run dev
```

---

## 🏗️ Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | Java, Spring Boot (Data JPA, Security) |
| Database | Microsoft SQL Server |
| Build Tools | Maven, npm |
