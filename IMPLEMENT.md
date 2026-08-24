# IMPLEMENT.md — NORA E-Commerce Implementation Plan

> **Mục tiêu:** dùng tài liệu này làm source-of-truth duy nhất để triển khai một website thương mại điện tử chuyên nghiệp, có mock data, backend hoạt động như một ecommerce thực tế ở mức demo/MVP và public được trên Vercel.
>
> **Nguyên tắc:** không phát triển theo kiểu dựng UI trước rồi bổ sung chức năng sau. Mọi page, component, API, data model, trạng thái và tiêu chí nghiệm thu đều phải được triển khai theo kế hoạch dưới đây.

---

# 1. PRODUCT VISION

## 1.1 Mục tiêu sản phẩm

Xây dựng NORA — một website thương mại điện tử B2C hiện đại với trải nghiệm:

- Khám phá sản phẩm nhanh.
- Tìm kiếm và lọc sản phẩm hiệu quả.
- Xem product detail đầy đủ thông tin.
- Thêm sản phẩm vào wishlist/cart.
- Checkout với tư cách guest.
- Tạo đơn hàng mock.
- Theo dõi đơn hàng.
- Quản lý dữ liệu ở admin dashboard.
- Responsive trên desktop, tablet và mobile.
- Có backend API thật về mặt interaction nhưng sử dụng mock/in-memory data.
- Deploy public trên Vercel.

## 1.2 Phạm vi MVP

### Customer

- Homepage.
- Category/product listing.
- Search.
- Filter.
- Sort.
- Product detail.
- Product variants.
- Reviews/rating mock.
- Wishlist/favorites.
- Shopping cart.
- Shipping calculation mock.
- Guest checkout.
- Mock payment.
- Order creation.
- Order success.
- Account.
- Order history.

### Admin

- Dashboard.
- Product management.
- Inventory overview.
- Order management.
- Customer/order statistics mock.

### Backend

- Product API.
- Category/filter/query API.
- Cart state.
- Order API.
- Auth mock.
- Admin data API tối thiểu nếu cần.

### Không nằm trong MVP

- Thanh toán tiền thật.
- Database production.
- OAuth production.
- Email transaction thật.
- Shipping provider thật.
- ERP/CRM integration.
- Multi-vendor marketplace.
- Real-time inventory synchronization.

---

# 2. MARKET SURVEY & UX REQUIREMENTS

## 2.1 Kết luận khảo sát

Thị trường ecommerce hiện không chỉ cạnh tranh về visual mà còn cạnh tranh mạnh ở khả năng giúp người dùng tìm đúng sản phẩm và hoàn tất checkout ít ma sát.

Baymard cho biết trong benchmark Product List UX 2025, 58% ecommerce desktop và 78% ecommerce mobile được đánh giá ở mức poor/mediocre về product-list UX. Nghiên cứu cũng nhấn mạnh vai trò của filter, sort, search và cách hiển thị product list trong việc giúp người dùng tìm sản phẩm. 

Nguồn tham khảo:
- Baymard — Product List UX 2025.
- Baymard — E-commerce Product Lists & Filtering UX.

## 2.2 Search / filter / sort

Catalog phải hỗ trợ đồng thời:

- Search theo keyword.
- Filter theo category.
- Filter theo price.
- Filter theo rating.
- Filter theo brand.
- Filter theo color.
- Filter theo size khi category có size.
- Filter theo availability.
- Filter sale/new nếu dữ liệu có.
- Sort theo recommended.
- Sort theo newest.
- Sort theo rating.
- Sort price ascending.
- Sort price descending.
- Hiển thị applied filters.
- Có clear-all filters.
- Empty state khi không có sản phẩm.

Baymard cho rằng product list tốt thường phải cung cấp search + filtering + sorting cùng nhau; các filter phổ biến cần có gồm price, rating, color, size và brand khi phù hợp với catalog.

## 2.3 Product Detail Page

Product page là điểm quyết định mua hàng nên cần chứa đầy đủ thông tin cần thiết:

- Product images.
- Thumbnail gallery.
- Brand.
- Product name.
- Rating.
- Review count.
- Current price.
- Compare-at price nếu sale.
- Discount badge.
- Stock state.
- Variant selection.
- Quantity selector.
- Add to cart.
- Buy now mock.
- Description.
- Specifications.
- Shipping information.
- Return information.
- Reviews mock.
- Related products.
- Recently viewed nếu có thời gian.

Nguồn tham khảo: Baymard Product Page UX Research.

## 2.4 Cart UX

Cart phải cho phép:

- Xem toàn bộ items.
- Thay đổi quantity.
- Remove item.
- Continue shopping.
- Xem subtotal.
- Xem shipping fee.
- Xem discount nếu có.
- Xem final total.
- Đi tới checkout.
- Empty cart state.

Không được để user phải quay về product page chỉ để thay đổi quantity.

## 2.5 Checkout UX

Checkout là flow quan trọng nhất của MVP.

Nguyên tắc:

- Guest-first.
- Không ép tạo account.
- Form ngắn.
- Một `fullName` thay vì tách unnecessary fields.
- Shipping information rõ ràng.
- Payment mock rõ ràng.
- Final total phải hiển thị trước khi user submit payment/order.
- Review trước Place Order.
- Có Edit ở các section đã nhập.
- Không thay đổi phí bất ngờ ở bước cuối.
- Mobile single-column.
- CTA mô tả chính xác hành động.

Baymard khuyến nghị minimize form fields, cho phép edit trực tiếp ở review và hiển thị final total trước payment fields.

Nguồn tham khảo:
- Baymard — Payment UX.
- Baymard — Checkout Flow UX Optimization.
- Baymard — Checkout Flow / Form Fields.

## 2.6 Mobile UX

Mobile phải được xem là first-class experience, không chỉ là desktop thu nhỏ.

Yêu cầu:

- Header thu gọn.
- Search dễ truy cập.
- Cart dễ thấy.
- Product grid 2 cột.
- Filter mở dạng drawer/sheet.
- Mobile filter có nút `Show X Results`.
- Touch target đủ lớn.
- Không horizontal overflow.
- Checkout một cột.
- Sticky checkout CTA khi hợp lý.

---

# 3. DESIGN SYSTEM — BẮT BUỘC ĐỌC DESIGN.md

## 3.1 Rule

Trước khi code UI, developer phải đọc:

```text
DESIGN.md
```

Không tự ý thay đổi màu, radius, typography, spacing hoặc component visual nếu DESIGN.md đã quy định.

## 3.2 Design tokens hiện tại

Nếu DESIGN.md chưa cung cấp hệ thống mới thì sử dụng baseline sau:

```text
Background:  #f7f4ef
Surface:     #fffdf9
Ink:         #1b1b18
Muted:       #6d6a62
Line:        #dedad0
Primary:     #173d36
Accent:      #c87941
Soft Green:  #e9eee8
```

## 3.3 Visual direction

- Premium minimal.
- Editorial typography.
- Warm neutral background.
- Deep green primary.
- Warm orange accent.
- Generous whitespace.
- Borders nhẹ.
- Rounded cards.
- Không lạm dụng shadow.
- Không sử dụng quá nhiều màu.
- CTA chính phải nổi bật.

## 3.4 Components

### Product Card

Bắt buộc có:

- Media 1:1.
- Badge.
- Brand.
- Title.
- Rating.
- Price.
- Compare-at price nếu có.
- Add-to-cart action.
- Favorite action.

### Button

Các variant:

```text
primary
secondary
outline
ghost
danger
```

### Badge

Các state:

```text
new
sale
sold-out
low-stock
featured
```

### Form

Phải có:

- Label.
- Input.
- Error.
- Helper text khi cần.
- Focus state.
- Disabled state.
- Loading state.

### Feedback

Phải có:

- Toast.
- Empty state.
- Error state.
- Loading state.
- Success state.
- Skeleton.

---

# 4. INFORMATION ARCHITECTURE

## 4.1 Sitemap

```text
/
├── products
│   ├── ?q=
│   ├── ?category=
│   └── ?filters=
│
├── products/[slug]
│
├── cart
│
├── checkout
│
├── order/[id]
│
├── account
│   ├── orders
│   ├── wishlist
│   └── profile
│
└── admin
    ├── dashboard
    ├── products
    ├── orders
    └── inventory
```

## 4.2 Navigation

### Desktop

- Logo.
- Category navigation.
- Search.
- Account.
- Wishlist.
- Cart.

### Mobile

- Logo.
- Search.
- Cart.
- Menu drawer.

---

# 5. USER FLOWS

## 5.1 Browse → Product → Cart

```text
Home
 ↓
Category
 ↓
Product Listing
 ↓
Product Detail
 ↓
Select Variant
 ↓
Select Quantity
 ↓
Add to Cart
 ↓
Cart
```

Acceptance:

- Variant bắt buộc được chọn nếu sản phẩm có variant.
- Không thể add quantity vượt stock.
- Cart cập nhật ngay.

## 5.2 Search Flow

```text
Search Input
 ↓
Query
 ↓
Search Results
 ↓
Filter
 ↓
Sort
 ↓
Product Detail
```

## 5.3 Checkout Flow

```text
Cart
 ↓
Checkout
 ↓
Shipping Information
 ↓
Delivery Method
 ↓
Payment Mock
 ↓
Review Order
 ↓
Place Order
 ↓
Order Success
```

Không yêu cầu đăng ký account.

## 5.4 Account Flow

```text
Login Mock
 ↓
Account
 ├── Profile
 ├── Orders
 └── Wishlist
```

## 5.5 Admin Flow

```text
Admin Login Mock
 ↓
Dashboard
 ├── Products
 ├── Inventory
 └── Orders
```

---

# 6. TECH STACK

## 6.1 Frontend

```text
Next.js
React
TypeScript
App Router
CSS / CSS Modules hoặc global CSS theo DESIGN.md
Heroicons hoặc icon library tương thích
```

## 6.2 Backend

Sử dụng Next.js Route Handlers:

```text
app/api/**/route.ts
```

Backend nằm trong cùng repository với frontend.

## 6.3 State

### Client state

- Cart.
- Wishlist.
- Selected product variant.
- UI state.
- Toast.

Có thể dùng React Context + reducer hoặc Zustand.

MVP ưu tiên:

```text
React Context + reducer
```

để giảm dependency.

### Persistence

Mock/demo:

```text
localStorage
```

Lưu:

```text
nora-cart
nora-wishlist
nora-recently-viewed
```

## 6.4 Data

MVP:

```text
TypeScript mock data
```

Production upgrade:

```text
PostgreSQL
Prisma hoặc Drizzle ORM
```

## 6.5 Validation

Dùng:

```text
Zod
```

cho request/API schema và checkout validation.

## 6.6 Testing

Unit/integration:

```text
Vitest
```

E2E:

```text
Playwright
```

Lint/type checking:

```text
ESLint
TypeScript
```

## 6.7 Deployment

```text
Vercel
```

Next.js App Router + Route Handlers phù hợp với mô hình deploy serverless của Vercel.

---

# 7. PROJECT STRUCTURE

```text
nora/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   │
│   ├── products/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── cart/
│   │   └── page.tsx
│   │
│   ├── checkout/
│   │   └── page.tsx
│   │
│   ├── order/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── account/
│   │   ├── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   └── wishlist/
│   │       └── page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   └── inventory/
│   │       └── page.tsx
│   │
│   └── api/
│       ├── products/
│       │   └── route.ts
│       ├── products/[id]/
│       │   └── route.ts
│       ├── orders/
│       │   └── route.ts
│       ├── orders/[id]/
│       │   └── route.ts
│       └── auth/
│           └── route.ts
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   ├── admin/
│   └── ui/
│
├── lib/
│   ├── data/
│   │   ├── products.ts
│   │   ├── categories.ts
│   │   ├── orders.ts
│   │   └── users.ts
│   │
│   ├── store/
│   │   ├── product-store.ts
│   │   ├── order-store.ts
│   │   └── auth-store.ts
│   │
│   ├── services/
│   │   ├── catalog.ts
│   │   ├── order.ts
│   │   └── pricing.ts
│   │
│   ├── validation/
│   │   ├── checkout.ts
│   │   ├── product.ts
│   │   └── order.ts
│   │
│   ├── utils.ts
│   └── types.ts
│
├── public/
│   └── images/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── DESIGN.md
├── IMPLEMENT.md
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

# 8. DATA MODEL

## 8.1 Product

```ts
interface Product {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  categorySlug: string
  description: string
  price: number
  compareAt?: number
  currency: 'VND'
  rating: number
  reviewCount: number
  images: string[]
  thumbnail: string
  badge?: 'NEW' | 'SALE' | 'FEATURED'
  stock: number
  colors?: ProductColor[]
  sizes?: string[]
  variants?: ProductVariant[]
  specs: Record<string, string>
  featured: boolean
  createdAt: string
}
```

## 8.2 Product Variant

```ts
interface ProductVariant {
  id: string
  name: string
  sku: string
  price?: number
  stock: number
  attributes: Record<string, string>
}
```

## 8.3 Cart Item

```ts
interface CartItem {
  productId: string
  variantId?: string
  quantity: number
  price: number
}
```

## 8.4 Address

```ts
interface ShippingAddress {
  fullName: string
  phone: string
  email: string
  address: string
  city: string
  district?: string
  ward?: string
  note?: string
}
```

## 8.5 Order

```ts
interface Order {
  id: string
  items: OrderItem[]
  customer: ShippingAddress
  subtotal: number
  shippingFee: number
  discount: number
  total: number
  paymentMethod: 'COD' | 'MOCK_CARD'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED'
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
  createdAt: string
}
```

## 8.6 User

```ts
interface User {
  id: string
  name: string
  email: string
  role: 'CUSTOMER' | 'ADMIN'
  wishlist: string[]
  orders: string[]
}
```

---

# 9. MOCK DATA STRATEGY

## 9.1 Catalog size

Tối thiểu:

- 40 products.
- 6 categories.
- 8 brands.
- 10+ products có variants.
- 10+ products sale.
- 5+ products low-stock.
- 5+ products featured.
- 20+ reviews mock.
- 10+ orders.

## 9.2 Category mẫu

Có thể sử dụng:

```text
New Arrivals
Clothing
Shoes
Bags
Accessories
Lifestyle
```

Nếu category thật của dự án được xác định lại, giữ nguyên schema và thay nội dung data.

## 9.3 Mock order data

Tạo các trạng thái:

```text
PENDING
CONFIRMED
SHIPPING
DELIVERED
CANCELLED
```

Mỗi status phải có ít nhất một order để admin dashboard có dữ liệu thực tế.

## 9.4 Image strategy

Ưu tiên local/mock images trong `public/images` để demo không phụ thuộc API ngoài.

Không hard-code image URL chết trong component.

---

# 10. PRICING & BUSINESS RULES

## 10.1 Subtotal

```text
subtotal = Σ(unitPrice × quantity)
```

## 10.2 Shipping

MVP rule:

```text
subtotal >= 1,000,000 → free shipping
subtotal < 1,000,000 → 30,000 VND
```

Phải đặt rule trong:

```text
lib/services/pricing.ts
```

Không tính shipping trực tiếp trong UI.

## 10.3 Discount

MVP có thể hỗ trợ:

```text
discount = product-level sale price
```

Optional:

```text
coupon mock
```

Không xây coupon engine phức tạp nếu không cần.

## 10.4 Stock

Không cho phép:

```text
quantity <= 0
quantity > stock
```

Nếu API tạo order phát hiện stock không đủ:

```text
HTTP 409 Conflict
```

---

# 11. API SPECIFICATION

## 11.1 GET /api/products

### Query

```text
q
category
brand
minPrice
maxPrice
rating
color
size
inStock
sort
page
limit
```

### Response

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 0,
    "totalPages": 0
  },
  "filters": {}
}
```

## 11.2 GET /api/products/[id]

Trả về product detail.

404 nếu không tồn tại.

## 11.3 POST /api/products

Admin tạo product.

Validation bằng Zod.

## 11.4 PATCH /api/products/[id]

Admin update product.

## 11.5 DELETE /api/products/[id]

Admin delete product.

## 11.6 GET /api/orders

Admin hoặc current mock user lấy order list.

Filters:

```text
status
search
page
limit
```

## 11.7 GET /api/orders/[id]

Lấy order detail.

## 11.8 POST /api/orders

Input:

```json
{
  "items": [],
  "customer": {},
  "paymentMethod": "COD"
}
```

Server phải:

1. Validate input.
2. Load products.
3. Validate stock.
4. Recalculate price.
5. Recalculate shipping.
6. Create order ID.
7. Save order mock.
8. Return order.

Không tin subtotal/total do client gửi.

## 11.9 PATCH /api/orders/[id]

Chỉ admin demo.

Cho phép đổi status.

Các chuyển trạng thái hợp lệ:

```text
PENDING → CONFIRMED
PENDING → CANCELLED
CONFIRMED → SHIPPING
CONFIRMED → CANCELLED
SHIPPING → DELIVERED
```

## 11.10 POST /api/auth

Mock authentication.

Input:

```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

Output token/session mock.

Không lưu password thật.

---

# 12. PAGE-BY-PAGE IMPLEMENTATION

# Phase 0 — Discovery & Foundation

## Task 0.1

Đọc `DESIGN.md`.

## Task 0.2

Chuyển DESIGN tokens vào CSS variables.

## Task 0.3

Tạo project Next.js TypeScript.

## Task 0.4

Cấu hình ESLint + TypeScript strict.

## Task 0.5

Tạo directory architecture.

## Task 0.6

Tạo TypeScript domain types.

### Done when

- `npm run dev` hoạt động.
- `npm run lint` không lỗi.
- `npm run typecheck` không lỗi.
- CSS tokens hoạt động.

---

# Phase 1 — Global UI

## Task 1.1 Header

Desktop:

- Logo.
- Navigation.
- Search.
- Wishlist.
- Account.
- Cart.

Mobile:

- Logo.
- Search.
- Cart.
- Menu.

## Task 1.2 Footer

- Brand.
- Customer service.
- About.
- Policies.
- Social.

## Task 1.3 UI primitives

Build:

```text
Button
Input
Select
Badge
Card
Modal
Drawer
Toast
Skeleton
EmptyState
Pagination
```

## Done when

Tất cả page dùng chung UI primitives và không lặp style vô tổ chức.

---

# Phase 2 — Homepage

## Sections

1. Header.
2. Hero.
3. Featured categories.
4. Featured products.
5. New arrivals.
6. Sale products.
7. Brand/value proposition.
8. Newsletter mock.
9. Footer.

## Hero CTA

CTA phải dẫn đến catalog/category thật, không dùng dead button.

## Done when

Homepage responsive và mọi CTA quan trọng đều có navigation thực.

---

# Phase 3 — Product Listing

## Features

- Product grid.
- Search.
- Category.
- Filter.
- Sort.
- Pagination/load more.
- Applied filter chips.
- Result count.
- Empty state.
- Skeleton.

## Desktop

```text
Sidebar filters | Product Grid
```

## Mobile

```text
Search
Filter / Sort
Applied filters
Product Grid 2 columns
```

## Done when

User có thể biến một catalog lớn thành một tập nhỏ sản phẩm liên quan bằng nhiều filter cùng lúc.

---

# Phase 4 — Product Detail

## Layout

Desktop:

```text
Image Gallery | Product Information
```

Mobile:

```text
Gallery
Product Info
Variant
Quantity
CTA
Description
Specs
Reviews
Related
```

## Functional requirements

- Gallery switching.
- Variant selection.
- Price changes theo variant nếu có.
- Stock validation.
- Quantity validation.
- Add cart.
- Favorite.
- Related product navigation.

## Done when

Một product có variant phải không thể add cart nếu variant required nhưng chưa chọn.

---

# Phase 5 — Cart

## Features

- List items.
- Thumbnail.
- Product name.
- Variant.
- Price.
- Quantity control.
- Remove.
- Subtotal.
- Shipping.
- Total.
- Checkout CTA.

## Edge cases

- Empty.
- Stock decreased.
- Quantity exceeds stock.
- Product removed from catalog.

## Done when

Cart refresh lại browser vẫn giữ state.

---

# Phase 6 — Checkout

## Step 1 — Shipping

Fields:

```text
Full name
Email
Phone
Address
City
District/Ward optional
Note optional
```

## Step 2 — Delivery

Mock options:

```text
Standard
Express
```

## Step 3 — Payment

Mock:

```text
COD
Mock Card
```

Hiển thị rõ đây là demo payment.

## Step 4 — Review

Hiển thị:

- Items.
- Shipping.
- Payment method.
- Address.
- Total.
- Edit actions.

## Place Order

Submit → API → order success.

## Done when

User không login vẫn hoàn tất được order.

---

# Phase 7 — Order Success

Hiển thị:

- Order ID.
- Order status.
- Total.
- Shipping information.
- Items.
- Continue shopping.
- View order.

---

# Phase 8 — Account

## Profile

- Name.
- Email.
- Phone.

## Orders

- Order ID.
- Date.
- Amount.
- Status.
- View details.

## Wishlist

- Product grid.
- Remove.
- Add to cart.

Nếu auth mock chưa hoàn chỉnh, account có thể dùng demo user session.

---

# Phase 9 — Admin Dashboard

## Dashboard

KPI cards:

```text
Revenue
Orders
Customers
Products
Low Stock
```

Charts nếu phù hợp:

```text
Revenue trend
Order status distribution
Top products
```

## Product management

- List.
- Search.
- Filter.
- Create.
- Edit.
- Delete.
- Stock.

## Orders

- Table.
- Search.
- Filter by status.
- Order detail.
- Update status.

## Inventory

- Stock.
- Low stock.
- Out of stock.

---

# 13. ACCESSIBILITY

Bắt buộc:

- Semantic HTML.
- Keyboard navigation.
- Visible focus.
- Alt text.
- Label form.
- Error message liên kết input.
- Button không dùng div giả button.
- Modal/drawer có focus management.
- Color không phải cách duy nhất để truyền state.
- Contrast đủ tốt.

---

# 14. PERFORMANCE

## Images

- `next/image`.
- Responsive sizing.
- Lazy loading cho below-the-fold.
- Local optimized mock images.

## Rendering

- Server Components mặc định.
- Client Components chỉ khi cần state/browser APIs.
- Không biến toàn bộ app thành client component.

## Data

- Mock data phải được tách khỏi UI.
- Filtering/sorting nằm trong service/helper.
- Không duplicate logic giữa page và API.

## Performance target

MVP target:

- Fast initial render.
- Không layout shift lớn.
- Không request thừa.
- Không console error.

---

# 15. SEO

Mỗi product page phải có:

- Unique title.
- Meta description.
- Canonical URL nếu cần.
- Open Graph image.
- Product structured data có thể bổ sung ở phase nâng cao.

Catalog page có metadata theo category/search context.

Homepage có metadata brand.

---

# 16. ERROR HANDLING

## UI

Các trạng thái bắt buộc:

```text
loading
success
empty
error
```

## API

Response format:

```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

HTTP mapping:

```text
200 success
201 created
400 invalid input
401 unauthorized
403 forbidden
404 not found
409 conflict
422 validation
500 server error
```

Không trả stack trace cho client.

---

# 17. SECURITY BASELINE

Dù đây là mock project, code phải được viết theo hướng production-ready.

## Rules

- Không tin dữ liệu price từ client.
- Không trust role từ frontend.
- Validate API input.
- Không hard-code secret.
- Không commit `.env`.
- Escape/sanitize user-controlled content khi cần.
- Không lưu password plaintext.
- Không expose internal errors.

---

# 18. TEST PLAN

## 18.1 Unit tests

Test:

- price calculation.
- shipping calculation.
- discount.
- stock validation.
- filter.
- sort.
- search normalization.
- order total.
- status transition.

## 18.2 Integration tests

Test:

- GET products.
- GET product detail.
- POST product.
- PATCH product.
- DELETE product.
- POST order.
- GET order.
- PATCH order.
- invalid request.
- out-of-stock request.

## 18.3 E2E tests

### Scenario A — Browse

```text
Open homepage
→ Open category
→ Search
→ Filter
→ Open product
```

Expected: correct results.

### Scenario B — Cart

```text
Open product
→ select variant
→ add cart
→ increase quantity
→ remove item
```

Expected: subtotal updates correctly.

### Scenario C — Guest checkout

```text
Add product
→ cart
→ checkout
→ enter shipping
→ select payment
→ review
→ place order
```

Expected: order success + order ID.

### Scenario D — Admin

```text
Open admin
→ inspect KPI
→ inspect orders
→ update order status
→ inspect inventory
```

Expected: state updates.

---

# 19. TEST CASE MATRIX

| Area | Test | Expected |
|---|---|---|
| Search | valid keyword | matching products |
| Search | invalid keyword | empty state |
| Filter | one filter | correct subset |
| Filter | multiple filters | AND/expected faceting logic |
| Sort | price asc | lowest first |
| Sort | price desc | highest first |
| Cart | add item | item appears |
| Cart | quantity +1 | subtotal increases |
| Cart | quantity 0 | item removed or blocked |
| Cart | over stock | blocked |
| Checkout | missing name | validation error |
| Checkout | invalid email | validation error |
| Checkout | empty cart | checkout blocked |
| Order | valid order | 201 + order id |
| Order | invalid stock | 409 |
| Product API | missing ID | 404 |
| Admin | change status | status updated |

---

# 20. RESPONSIVE QA MATRIX

| Viewport | Expected |
|---|---|
| 1440×900 | 4-column product grid |
| 1280×800 | 4-column / reduced spacing |
| 1024×768 | 2-column / tablet navigation |
| 768×1024 | tablet layout |
| 430×932 | mobile 2-column |
| 390×844 | mobile 2-column |
| 360×800 | compact mobile |

Không được có:

- Horizontal scroll.
- Text overflow.
- Clipped CTA.
- Broken image ratio.
- Overlapping modal.
- Checkout button nằm ngoài viewport trong trạng thái quan trọng.

---

# 21. IMPLEMENTATION ORDER

Không triển khai theo thứ tự ngẫu nhiên.

```text
01. Read DESIGN.md
02. Setup Next.js
03. Setup types
04. Setup mock data
05. Setup global styles
06. Setup UI primitives
07. Build Header/Footer
08. Build Homepage
09. Build Product Listing
10. Build Product Detail
11. Build Cart
12. Build Pricing Service
13. Build Checkout
14. Build Order API
15. Build Order Success
16. Build Account
17. Build Admin
18. Add validation
19. Add error/loading/empty states
20. Add tests
21. Responsive QA
22. Accessibility QA
23. SEO
24. Production build
25. Vercel deployment
26. Public smoke test
```

---

# 22. GIT / DEVELOPMENT WORKFLOW

## Branch

```text
main
feature/*
fix/*
```

## Commit convention

```text
feat:
fix:
refactor:
style:
test:
docs:
chore:
```

Ví dụ:

```text
feat: implement product filters
feat: add guest checkout
fix: prevent cart quantity over stock
test: add order pricing tests
```

---

# 23. ENVIRONMENT

## Development

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Vercel

```env
NEXT_PUBLIC_APP_URL=https://<project>.vercel.app
```

Không commit secret.

Nếu chưa có service external, không tạo environment variable giả.

---

# 24. VERCEL DEPLOYMENT PLAN

## Step 1

Push repository lên GitHub.

## Step 2

Import repository vào Vercel.

## Step 3

Framework:

```text
Next.js
```

## Step 4

Build command:

```bash
npm run build
```

## Step 5

Environment variables nếu có.

## Step 6

Deploy.

## Step 7 — Smoke test

Kiểm tra public URL:

```text
/
/products
/products/[slug]
/cart
/checkout
/order/[id]
/account
/admin
/api/products
/api/orders
```

---

# 25. PRODUCTION UPGRADE ROADMAP

Khi MVP đã ổn định, chuyển từng phần:

## V1 — Persistent backend

```text
PostgreSQL
↓
Prisma/Drizzle
↓
Repositories
↓
Services
↓
API
```

## V2 — Authentication

Thay mock auth bằng:

```text
Auth.js / Clerk / equivalent
```

Có:

- Session.
- Password reset.
- Email verification.
- Role-based access.

## V3 — Payment

Tích hợp payment gateway phù hợp thị trường mục tiêu.

Order phải có payment state machine:

```text
PENDING
AUTHORIZED
PAID
FAILED
REFUNDED
```

## V4 — Inventory

Chuyển từ static stock sang transaction-safe stock.

## V5 — Search

Nếu catalog lớn:

```text
Postgres full-text
hoặc dedicated search engine
```

## V6 — Observability

```text
Vercel Analytics
Sentry
structured logging
```

## V7 — Marketing

- SEO pages.
- Product schema.
- Analytics events.
- Conversion tracking.
- Abandoned cart.
- Email flows.
- Coupon engine.

---

# 26. ANALYTICS EVENTS — OPTIONAL MVP+ 

Event schema chuẩn hóa:

```text
page_view
search
filter_applied
product_view
add_to_cart
remove_from_cart
begin_checkout
add_shipping_info
add_payment_info
purchase
wishlist_add
wishlist_remove
```

Ví dụ:

```json
{
  "event": "add_to_cart",
  "productId": "p_001",
  "quantity": 1,
  "price": 499000
}
```

Không gửi dữ liệu nhạy cảm không cần thiết.

---

# 27. DEFINITION OF DONE

## Product

- [ ] Homepage hoàn chỉnh.
- [ ] Catalog hoàn chỉnh.
- [ ] Search hoạt động.
- [ ] Filter hoạt động.
- [ ] Sort hoạt động.
- [ ] Product detail hoàn chỉnh.
- [ ] Wishlist hoạt động.
- [ ] Cart hoạt động.
- [ ] Guest checkout hoạt động.
- [ ] Mock payment hoạt động.
- [ ] Order creation hoạt động.
- [ ] Order success hoạt động.
- [ ] Account hoạt động.
- [ ] Admin dashboard hoạt động.
- [ ] Inventory hoạt động.
- [ ] Order management hoạt động.

## Engineering

- [ ] TypeScript không error.
- [ ] ESLint không error.
- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] E2E critical flow pass.
- [ ] Responsive QA pass.
- [ ] Accessibility baseline pass.
- [ ] No console errors.
- [ ] No broken links.
- [ ] No dead CTA.
- [ ] No horizontal overflow.

## Deployment

- [ ] Production build pass.
- [ ] Vercel deployment pass.
- [ ] Public URL hoạt động.
- [ ] `/api/products` hoạt động.
- [ ] `/api/orders` hoạt động.
- [ ] Guest checkout trên public URL pass.
- [ ] Admin mock route pass.

---

# 28. PRIORITY MATRIX

## P0 — bắt buộc

```text
Design system
Homepage
Catalog
Search
Filter
Product Detail
Cart
Checkout
Order API
Responsive
Vercel deployment
```

## P1 — rất nên có

```text
Wishlist
Account
Order history
Admin dashboard
Inventory
Product CRUD
Order status management
Tests
SEO
Accessibility
```

## P2 — nâng cấp sau MVP

```text
Real database
Real auth
Real payment
Real shipping
Email
Analytics
Search engine
Recommendations
Reviews thật
Coupon engine
```

---

# 29. ACCEPTANCE CRITERIA CUỐI CÙNG

Website được xem là hoàn thành MVP khi một user chưa từng truy cập website có thể:

```text
1. Mở homepage
2. Hiểu ngay website bán gì
3. Tìm product bằng search
4. Lọc product
5. Sort product
6. Mở product detail
7. Chọn variant
8. Add to cart
9. Sửa quantity
10. Đi checkout
11. Không cần tạo account
12. Nhập shipping info
13. Chọn mock payment
14. Review order
15. Place order
16. Nhận order ID
17. Xem order detail
```

Đồng thời admin demo có thể:

```text
1. Xem dashboard
2. Xem product list
3. Xem inventory
4. Xem order list
5. Mở order detail
6. Đổi order status
7. Tạo/sửa/xóa product mock
```

---

# 30. NGUYÊN TẮC CODE CUỐI CÙNG

1. UI không chứa business logic phức tạp.
2. Business logic nằm trong services/helpers.
3. API luôn validate input.
4. Server tự tính lại tiền.
5. Client không được quyết định giá cuối cùng.
6. Không duplicate data giữa nhiều file.
7. Không hard-code product trong component.
8. Component lớn phải được chia nhỏ.
9. Client component chỉ dùng khi thực sự cần browser state.
10. Error/loading/empty state là một phần của UI chính thức.
11. Responsive phải được xây dựng ngay từ đầu.
12. Design phải lấy `DESIGN.md` làm source-of-truth.
13. Mọi feature mới phải có acceptance criteria.
14. Mọi API mới phải có validation và error response.
15. Không thêm dependency chỉ cho một UI nhỏ nếu có thể giải quyết bằng codebase hiện tại.

---

# 31. NGUỒN THAM KHẢO KHẢO SÁT

- Baymard Institute — Product List UX 2025:
  https://baymard.com/blog/current-state-product-list-and-filtering

- Baymard Institute — E-commerce Product Lists & Filtering UX:
  https://baymard.com/research/ecommerce-product-lists

- Baymard Institute — Ecommerce Filter UI Best Practices:
  https://baymard.com/learn/ecommerce-filter-ui

- Baymard Institute — Product Page UX:
  https://baymard.com/research/product-page

- Baymard Institute — Payment UX:
  https://baymard.com/learn/payment-ux

- Baymard Institute — Checkout Flow UX Optimization:
  https://baymard.com/learn/checkout-flow-ux-optimization

- Baymard Institute — Checkout Form Fields:
  https://baymard.com/blog/checkout-flow-average-form-fields

- Next.js documentation:
  https://nextjs.org/docs

- Vercel documentation:
  https://vercel.com/docs

---

# 32. FINAL EXECUTION RULE

Khi bắt đầu implementation, developer chỉ cần đọc file này và `DESIGN.md`.

Thứ tự thực hiện bắt buộc:

```text
DESIGN.md
→ Phase 0
→ Phase 1
→ Phase 2
→ Phase 3
→ Phase 4
→ Phase 5
→ Phase 6
→ Phase 7
→ Phase 8
→ Phase 9
→ QA
→ Build
→ Vercel
→ Public smoke test
```

Không đánh dấu một phase là Done nếu acceptance criteria của phase đó chưa đạt.

**Mục tiêu cuối:** một ecommerce demo public, có visual chuyên nghiệp, responsive, interaction đầy đủ, backend mock có logic thực tế, test được và sẵn sàng nâng cấp lên production backend.
