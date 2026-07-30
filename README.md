# B-MART E-Commerce Frontend Web Application

React 18 + Vite frontend web application for B-MART, styled with an Amazon.in inspired modern layout.

---

## Technical Features
- **Core Tech:** React 18, Vite, JavaScript
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router v6 (`react-router-dom`)
- **HTTP Client:** Axios with JWT Interceptor (automatic Bearer token attachment)
- **UI Design System:** Amazon.in Inspired Header (Logo, Location, Category Search Bar, Account Menu, Wishlist & Cart Counter), High-Density Product Cards, Filter Sidebars, Step-by-Step Order Status Pipeline.
- **Payments:** Native Razorpay Checkout JS Integration with fallback modal support.

---

## Setup & Running Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The React frontend web application will start on `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```
Generates production bundle in `dist/`.
