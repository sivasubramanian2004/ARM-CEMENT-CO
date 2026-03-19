# Cement and Steel Shop Management

MERN-based management tool for cement and steel shops. Admins manage inventory and orders; customers browse and place orders.

## Stack
- Backend: Node.js, Express, MongoDB (Mongoose), JWT auth
- Frontend: React (Vite), React Router, Axios

## Setup
1) Install dependencies
```
cd server && npm install
cd ../client && npm install
```

2) Configure environment
- Copy `server/.env.example` to `server/.env` and set values.
- Copy `client/.env.example` to `client/.env` and point `VITE_API_BASE_URL` to the API.

3) Seed an admin user (optional but recommended)
```
cd server
npm run seed:admin
```

4) Run locally (two terminals)
```
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```
Backend defaults to http://localhost:4000, frontend to http://localhost:5173.

## API Notes
- Auth: POST `/api/auth/register`, POST `/api/auth/login`
- Products: GET `/api/products`, admin CRUD on `/api/products/:id`
- Orders: Auth required. POST `/api/orders` with items `{ productId, quantity }`. Admin can PATCH status `/api/orders/:id/status`.

## Scripts
- Backend: `npm run dev`, `npm start`, `npm run seed:admin`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## Testing ideas
- Register/login a customer, place an order.
- Seed admin, create products, update stock, and change order status.

## License
MIT
