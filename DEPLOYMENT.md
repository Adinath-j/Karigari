# Deployment Checklist

## Pre-deployment Tasks

### 1. Environment Variables
- [x] Update `.env.production` with correct backend URL
- [x] Ensure all sensitive data is stored as environment variables, not in code

### 2. Configuration Files
- [x] Update `vercel.json` with correct backend URL in routes
- [x] Update `render.yaml` with correct frontend URL
- [x] Verify `vite.config.js` has correct proxy settings
- [x] Verify `backend/server.js` has correct CORS settings

### 3. Code Updates
- [x] Update all placeholder URLs in configuration files:
  - `https://karigari-2xcq.onrender.com` → Your actual Render backend URL
  - `https://karigari-ruddy.vercel.app` → Your actual Vercel frontend URL

### 4. Database
- [x] Ensure MongoDB database is accessible from Render
- [x] Update `MONGODB_URL` environment variable with production database connection string

## Vercel Deployment (Frontend)

### Steps:
1. [ ] Push code to GitHub repository
2. [ ] Log in to Vercel dashboard
3. [ ] Click "New Project"
4. [ ] Import your GitHub repository
5. [ ] Configure project settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. [ ] Add environment variables:
   - `VITE_BACKEND_URL`: https://karigari-2xcq.onrender.com
7. [ ] Deploy

### Post-deployment:
- [ ] Verify frontend is accessible at https://karigari-ruddy.vercel.app
- [ ] Test API calls to backend
- [ ] Check that all pages load correctly

## Render Deployment (Backend)

### Steps:
1. [ ] Push code to GitHub repository
2. [ ] Log in to Render dashboard
3. [ ] Click "New+" → "Web Service"
4. [ ] Connect your GitHub repository
5. [ ] Configure service:
   - Name: karigari-backend
   - Runtime: Node
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Plan: Free or paid as needed
6. [ ] Add environment variables:
   - `NODE_ENV`: production
   - [PORT](file://c:\Users\adina\Desktop\Karigari\Karigari\backend\server.js#L34-L34): 10000
   - `MONGODB_URL`: "mongodb+srv://adinathjadhavisdev_db_user:adinathjadhavisdev_db_user@karigari.hriqfwk.mongodb.net/?retryWrites=true&w=majority&appName=Karigari"
   - `JWT_SECRET`: ksjdiugshd89gys87fgs883
   - `FRONTEND_URL`: https://karigari-ruddy.vercel.app
7. [ ] Deploy

### Post-deployment:
- [ ] Verify backend is accessible at https://karigari-2xcq.onrender.com
- [ ] Test API endpoints
- [ ] Check MongoDB connection
- [ ] Verify CORS is working correctly

## Post-deployment Verification

### Frontend Tests:
- [ ] Homepage loads correctly
- [ ] Login page is accessible
- [ ] User can register
- [ ] User can log in
- [ ] Products page loads
- [ ] Navigation works between pages

### Backend Tests:
- [ ] API endpoints are accessible
- [ ] User authentication works
- [ ] Database operations work
- [ ] CORS allows frontend requests
- [ ] Session management works

### Integration Tests:
- [ ] Frontend can communicate with backend
- [ ] User can complete full flow (register → login → view products → place order)
- [ ] Real-time chat works
- [ ] File uploads work (if applicable)

## Common Issues and Solutions

### CORS Errors:
- Check that `FRONTEND_URL` environment variable is set correctly in Render
- Verify CORS configuration in `backend/server.js`

### API Call Failures:
- Ensure `VITE_BACKEND_URL` is set correctly in Vercel
- Check that backend is running and accessible
- Verify API routes are correct

### Database Connection Issues:
- Verify `MONGODB_URL` is correct
- Ensure MongoDB instance is accessible from Render
- Check firewall settings if using a self-hosted MongoDB

### Session Issues:
- Ensure `JWT_SECRET` is set and consistent
- Check cookie settings in `backend/server.js`
- Verify that sessions are working across requests

## Monitoring and Maintenance

### Set up monitoring:
- [ ] Configure uptime monitoring for both frontend and backend
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure logging for debugging

### Regular maintenance:
- [ ] Monitor usage and upgrade plans if needed
- [ ] Keep dependencies updated
- [ ] Backup database regularly
- [ ] Monitor for security vulnerabilities