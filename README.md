# Personal Finance Tracker

Shaxsiy moliya boshqaruvi va kuzatish uchun to'liq funksional dastur. O'zbek so'mida (UZS) balans va tranzaksiyalarni kuzatish, budgetlar va qarzlarni boshqarish imkoniyatiga ega.

## Texnologiyalar

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lokal database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **Angular 17** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **PrimeNG** - UI component library
- **Chart.js** - Data visualization
- **RxJS** - Reactive programming

## Xususiyatlar

### ✅ Asosiy Funksiyalar

1. **Foydalanuvchi Autentifikatsiyasi**
   - Ro'yxatdan o'tish
   - Kirish
   - JWT token bilan xavfsiz autentifikatsiya

2. **Balans va Hisoblar**
   - Boshlang'ich balans kiritish
   - Karta va naqd pul hisoblarini boshqarish
   - Hisoblar o'rtasida pul o'tkazish (transferlar)

3. **Tranzaksiyalar**
   - Kirim va chiqimlarni kiritish
   - Kategoriyalar bo'yicha guruhlash
   - Tranzaksiyalarni tahrirlash va o'chirish
   - Sana bo'yicha filterlash
   - Kategoriya va hisob bo'yicha filterlash

4. **Kategoriyalar**
   - Oldindan tayyor kategoriyalar:
     - Kirim: Ish haqi, Biznes, Boshqa kirim
     - Chiqim: Oziq-ovqat, Transport, Uy-joy, Kommunal, Shaxsiy, O'yin-kulgi, Sog'liq, Ta'lim, Boshqa
   - Yangi kategoriyalar yaratish
   - Kategoriyalarni tahrirlash va o'chirish
   - Har bir kategoriya uchun rang va emoji

5. **Budgetlar**
   - Kunlik, haftalik, oylik va yillik budgetlar
   - Kategoriya bo'yicha budget limitlar
   - Budget sarfini real-time kuzatish
   - Ogohlantirish chegarasi (alert threshold)
   - Budget oshib ketganda bildirishnoma

6. **Qarzlar va Qarzdorlar**
   - Qarz (sizdan olgan) va Loan (siz olgan) lar
   - Qarz to'lov tarixini kuzatish
   - Qarz holati (active, partial, paid)
   - Muddati tugash sanasi

7. **Analytics va Dashboardlar**
   - Umumiy balans ko'rsatkichi
   - Oylik kirim/chiqim statistikasi
   - Kategoriya bo'yicha pie chart
   - Vaqt bo'yicha trend chartlar (line chart)
   - Kategoriya bo'yicha bar chart
   - Eng so'nggi tranzaksiyalar

8. **Qo'shimcha Funksiyalar**
   - Dark/Light mode
   - Export/Import (CSV format)
   - Responsive dizayn
   - Real-time balans yangilanishi

## O'rnatish va Ishga Tushirish

### Talablar

- **Node.js** v18 yoki yuqori versiya
- **npm** v9 yoki yuqori versiya
- **Angular CLI** v17 (optional, npm orqali o'rnatiladi)

### Backend O'rnatish

1. Backend papkasiga o'ting:
```bash
cd backend
```

2. Bog'liqliklarni o'rnating:
```bash
npm install
```

3. Ma'lumotlar bazasini yarating:
```bash
npm run init-db
```

4. Serverni ishga tushiring:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server http://localhost:3000 da ishga tushadi.

### Frontend O'rnatish

1. Frontend papkasiga o'ting:
```bash
cd frontend
```

2. Bog'liqliklarni o'rnating:
```bash
npm install
```

3. Development serverni ishga tushiring:
```bash
npm start
```

4. Brauzerda ochish:
```
http://localhost:4200
```

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Build fayllari dist/frontend papkasida bo'ladi
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish
- `GET /api/auth/profile` - Profil ma'lumotlarini olish

### Transactions
- `GET /api/transactions` - Barcha tranzaksiyalarni olish
- `POST /api/transactions` - Yangi tranzaksiya yaratish
- `GET /api/transactions/:id` - ID bo'yicha tranzaksiyani olish
- `PUT /api/transactions/:id` - Tranzaksiyani yangilash
- `DELETE /api/transactions/:id` - Tranzaksiyani o'chirish

### Categories
- `GET /api/categories` - Barcha kategoriyalarni olish
- `POST /api/categories` - Yangi kategoriya yaratish
- `PUT /api/categories/:id` - Kategoriyani yangilash
- `DELETE /api/categories/:id` - Kategoriyani o'chirish

### Budgets
- `GET /api/budgets` - Barcha budgetlarni olish
- `POST /api/budgets` - Yangi budget yaratish
- `GET /api/budgets/:id` - ID bo'yicha budgetni olish
- `PUT /api/budgets/:id` - Budgetni yangilash
- `DELETE /api/budgets/:id` - Budgetni o'chirish

### Debts
- `GET /api/debts` - Barcha qarzlarni olish
- `POST /api/debts` - Yangi qarz yaratish
- `GET /api/debts/:id` - ID bo'yicha qarzni olish
- `POST /api/debts/:id/payments` - Qarz to'lovi qo'shish
- `PUT /api/debts/:id` - Qarzni yangilash
- `DELETE /api/debts/:id` - Qarzni o'chirish

### Accounts
- `GET /api/accounts` - Barcha hisoblarni olish
- `POST /api/accounts` - Yangi hisob yaratish
- `PUT /api/accounts/:id` - Hisobni yangilash
- `DELETE /api/accounts/:id` - Hisobni o'chirish

### Transfers
- `GET /api/transfers` - Barcha transferlarni olish
- `POST /api/transfers` - Yangi transfer yaratish
- `DELETE /api/transfers/:id` - Transferni o'chirish

### Analytics
- `GET /api/analytics/dashboard` - Dashboard ma'lumotlarini olish
- `GET /api/analytics/trends` - Trend ma'lumotlarini olish
- `GET /api/analytics/category-breakdown` - Kategoriya bo'yicha tahlil
- `GET /api/analytics/monthly-report` - Oylik hisobot

## Database Schema

### Users
- id, username, email, password, initial_balance, current_balance, created_at, updated_at

### Accounts
- id, user_id, name, type (card/cash), balance, currency, created_at, updated_at

### Categories
- id, user_id, name, type (income/expense), icon, color, is_default, created_at

### Budgets
- id, user_id, category_id, name, amount, period, start_date, end_date, alert_threshold, created_at, updated_at

### Transactions
- id, user_id, account_id, category_id, budget_id, type (income/expense), amount, description, date, created_at, updated_at

### Transfers
- id, user_id, from_account_id, to_account_id, amount, description, date, created_at

### Debts
- id, user_id, type (debt/loan), person_name, amount, remaining_amount, description, due_date, status, created_at, updated_at

### Debt Payments
- id, debt_id, amount, payment_date, note, created_at

## Proyektni Development qilish

### Backend Development

Backend kodlari `backend/src` papkasida joylashgan:
- `controllers/` - API logic
- `routes/` - Route definitions
- `models/` - Database models
- `middleware/` - Authentication, error handling
- `config/` - Database configuration
- `utils/` - Helper functions

### Frontend Development

Frontend kodlari `frontend/src/app` papkasida joylashgan:
- `components/` - Angular components
- `services/` - API services
- `models/` - TypeScript interfaces
- `guards/` - Route guards

### Code Style

- Backend: JavaScript/Node.js
- Frontend: TypeScript/Angular
- Ikkalasida ham modulli arxitektura ishlatilgan
- RESTful API design patterns

## Xavfsizlik

- JWT token bilan autentifikatsiya
- bcryptjs bilan parollarni hashlash
- SQL injection dan himoyalash
- CORS konfiguratsiyasi
- Input validation (express-validator)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License

## Muallif

Ushbu proyekt shaxsiy moliyani boshqarish uchun yaratilgan.

## Kontakt

Savollar yoki takliflar bo'lsa, GitHub Issues orqali murojaat qiling.

---

**Muhim Eslatmalar:**

1. Production muhitda `.env` faylini to'g'ri sozlang
2. `JWT_SECRET` ni xavfsiz qiymat bilan almashtiring
3. Ma'lumotlar bazasi faylini muntazam backup qiling
4. HTTPS dan foydalaning production muhitda
5. API rate limiting qo'shing production uchun

**E'tibor bering:** Bu proyekt development va o'rganish maqsadlari uchun yaratilgan. Production muhitda ishlatishdan oldin qo'shimcha xavfsizlik choralarini ko'ring.
