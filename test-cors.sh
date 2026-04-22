#!/bin/bash

echo "=========================================="
echo "  MARATHON APP - CORS VERIFICATION TEST"
echo "=========================================="
echo ""

BACKEND_URL="http://localhost:4000"

echo "✅ Test 1: Health Check"
curl -s $BACKEND_URL/health
echo ""
echo ""

echo "✅ Test 2: CORS from GitHub Pages origin"
curl -s -H "Origin: https://doolinagaraj.github.io" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS $BACKEND_URL/api/events -D - 2>&1 | grep -i "access-control"
echo ""

echo "✅ Test 3: CORS from localhost:8080 (external simulation)"
curl -s -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS $BACKEND_URL/api/events -D - 2>&1 | grep -i "access-control"
echo ""

echo "✅ Test 4: CORS from random external domain"
curl -s -H "Origin: https://any-external-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -X OPTIONS $BACKEND_URL/api/auth/login -D - 2>&1 | grep -i "access-control"
echo ""

echo "=========================================="
echo "  ALL CORS TESTS COMPLETED!"
echo "=========================================="
echo ""
echo "If you see 'Access-Control-Allow-Origin' headers above,"
echo "then CORS is working correctly and accepting all origins."
echo ""
echo "📝 To test from another laptop on your network:"
echo "   1. Find your IP: hostname -I"
echo "   2. From another laptop, visit: http://YOUR_IP:8080/test-cors.html"
echo "   3. Update test-cors.html API_BASE_URL to: http://YOUR_IP:4000"
echo ""
