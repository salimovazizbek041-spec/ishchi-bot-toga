#!/bin/bash

echo "🚀 UstaTop deploy boshlanmoqda..."

# Backend deploy
echo "📦 Backend build qilinmoqda..."
cd server
npm install
echo "✅ Backend tayyor"

# Frontend build
echo "📦 Frontend build qilinmoqda..."
cd ../client
npm install
npm run build
echo "✅ Frontend tayyor"

# Railway deploy uchun
echo "🚂 Railway-ga deploy qilish..."
cd ..

echo "✅ Deploy tayyor!"
echo "📱 Frontend: https://ustatop.railway.app"
echo "🔧 Backend: https://ustatop-api.railway.app"
echo "👑 Admin: https://ustatop-api.railway.app/api/admin/login"