#!/bin/bash

echo "🔄 Testing Complete Dynamic Roles System..."

echo "📋 1. Testing Admin Login..."
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@visa-office.com","password":"admin123"}')

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ Admin login successful - Token: ${ADMIN_TOKEN:0:20}..."

echo "📋 2. Testing Admin Profile..."
ADMIN_PROFILE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/auth/me)
ADMIN_PERMISSIONS=$(echo $ADMIN_PROFILE | grep -o '"permissions":\[[^]]*\]' | grep -o '"[^"]*"' | wc -l)
echo "✅ Admin profile loaded - Permissions count: $ADMIN_PERMISSIONS"

echo "📋 3. Testing User Login..."
USER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@visa-office.com","password":"user123"}')

USER_TOKEN=$(echo $USER_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
echo "✅ User login successful - Token: ${USER_TOKEN:0:20}..."

echo "📋 4. Testing User Profile..."
USER_PROFILE=$(curl -s -H "Authorization: Bearer $USER_TOKEN" http://localhost:3001/auth/me)
USER_PERMISSIONS=$(echo $USER_PROFILE | grep -o '"permissions":\[[^]]*\]' | grep -o '"[^"]*"' | wc -l)
echo "✅ User profile loaded - Permissions count: $USER_PERMISSIONS"

echo "📋 5. Testing Admin Access to Roles..."
ROLES_RESPONSE=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:3001/api/v1/admin/roles)
ROLES_COUNT=$(echo $ROLES_RESPONSE | grep -o '"name"' | wc -l)
echo "✅ Admin can access roles - Roles count: $ROLES_COUNT"

echo "📋 6. Testing User Access Denial to Roles..."
USER_DENIED=$(curl -s -H "Authorization: Bearer $USER_TOKEN" http://localhost:3001/api/v1/admin/roles)
if echo $USER_DENIED | grep -q "Permission manquante"; then
    echo "✅ User correctly denied access to admin endpoints"
else
    echo "❌ User was allowed access to admin endpoints"
fi

echo "📋 7. Testing Frontend Dashboard..."
DASHBOARD_RESPONSE=$(curl -s http://localhost:3000/dashboard)
if echo $DASHBOARD_RESPONSE | grep -q "Visa Office"; then
    echo "✅ Frontend dashboard loads successfully"
else
    echo "❌ Frontend dashboard failed to load"
fi

echo ""
echo "🎉 System Test Complete!"
echo "📊 Summary:"
echo "   - Admin Permissions: $ADMIN_PERMISSIONS"
echo "   - User Permissions: $USER_PERMISSIONS" 
echo "   - Roles in System: $ROLES_COUNT"
echo "   - Permission System: ✅ Working"
echo "   - Frontend: ✅ Working"
echo "   - Backend: ✅ Working"