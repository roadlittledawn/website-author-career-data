# Deployment Guide - Netlify

This guide walks you through deploying the Career Data Admin Web App to Netlify.

## Prerequisites

Before deploying, ensure you have:

- ✅ A GitHub account with this repository
- ✅ A Netlify account ([sign up free](https://netlify.com))
- ✅ MongoDB database (MongoDB Atlas recommended)
- ✅ Environment variables ready (see below)

## Step 1: Prepare Environment Variables

You'll need these environment variables. Prepare them before starting the deployment:

### Required Variables

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=career-data

# Authentication
AUTH_SECRET=your-random-secret-key-for-jwt-signing
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=<bcrypt-hash-of-your-password>
```

### Generate Password Hash

Run this command locally to generate the bcrypt hash:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-actual-password', 10))"
```

**Example output:**
```
$2a$10$rN4.6EQHxYpO8Z7P5QhJweu8vMxmH9F.uI.PYmL9R2KqXdRwZvLqi
```

Save this hash - you'll need it for `ADMIN_PASSWORD_HASH`.

### Generate AUTH_SECRET

Generate a random secret key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
f3d4a5b6c7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3
```

## Step 2: Connect to Netlify

### Option A: Deploy via Netlify Dashboard (Recommended)

1. **Sign in to Netlify**: Go to [app.netlify.com](https://app.netlify.com)

2. **Create New Site**:
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub account

3. **Select Repository**:
   - Find and select `website-author-career-data`
   - Click the repository to proceed

4. **Configure Build Settings**:
   Netlify should auto-detect Next.js. Verify these settings:

   ```
   Build command:    next build
   Publish directory: .next
   Functions directory: netlify/functions
   ```

5. **Don't deploy yet** - First, we need to add environment variables

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site (run from project root)
netlify init

# Follow prompts:
# - Create & configure a new site
# - Choose your team
# - Enter site name (or leave blank for random)
```

## Step 3: Configure Environment Variables

### Via Netlify Dashboard

1. Go to your site in Netlify dashboard
2. Click **Site settings** → **Environment variables**
3. Click **Add a variable** for each one:

| Variable Name | Example Value | Notes |
|---------------|---------------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/` | Include trailing `/` |
| `MONGODB_DB_NAME` | `career-data` | Your database name |
| `AUTH_SECRET` | `f3d4a5b6...` | Generated random hex string |
| `ADMIN_USERNAME` | `admin` | Your admin username |
| `ADMIN_PASSWORD_HASH` | `$2a$10$rN4...` | Bcrypt hash from Step 1 |

4. Click **Save** after adding all variables

### Via Netlify CLI

```bash
netlify env:set MONGODB_URI "mongodb+srv://user:pass@cluster.mongodb.net/"
netlify env:set MONGODB_DB_NAME "career-data"
netlify env:set AUTH_SECRET "your-secret-key"
netlify env:set ADMIN_USERNAME "admin"
netlify env:set ADMIN_PASSWORD_HASH "$2a$10$rN4..."
```

## Step 4: Deploy

### Initial Deployment

#### Via Dashboard:
1. Click **Deploy site** (after adding environment variables)
2. Wait for build to complete (usually 2-3 minutes)
3. Netlify will provide your site URL: `https://your-site-name.netlify.app`

#### Via CLI:
```bash
# Deploy to production
netlify deploy --prod

# Netlify will ask for confirmation, then deploy
```

### Verify Deployment

1. **Check Build Logs**:
   - Dashboard: **Deploys** tab → Click latest deploy → **Deploy log**
   - Look for "Site is live" message

2. **Test the Site**:
   - Visit your Netlify URL
   - You should see the login page
   - Try logging in with your credentials

## Step 5: Set Up Custom Domain (Optional)

### Add Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Enter your domain (e.g., `career-admin.yourdomain.com`)
4. Follow DNS configuration instructions

### Configure DNS

Add these DNS records to your domain provider:

```
Type: CNAME
Name: career-admin (or your subdomain)
Value: your-site-name.netlify.app
```

### Enable HTTPS

Netlify automatically provisions SSL certificates via Let's Encrypt. After DNS propagation (usually 24 hours):

1. Go to **Domain settings** → **HTTPS**
2. Click **Verify DNS configuration**
3. Click **Provision certificate**

## Step 6: Configure MongoDB Network Access

Important: Your MongoDB database must allow connections from Netlify.

### For MongoDB Atlas:

1. Go to MongoDB Atlas dashboard
2. Click **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Select **Allow Access from Anywhere** (0.0.0.0/0)
   - Or add specific Netlify IP ranges if you prefer

**Security Note**: Netlify Functions use dynamic IPs, so "Allow from Anywhere" is typical. Your database is still protected by username/password in the connection string.

## Continuous Deployment

Netlify automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Netlify will:
1. Detect the push
2. Start building automatically
3. Deploy when build succeeds
4. Email you if build fails

### Deploy Previews

Netlify creates preview deployments for pull requests:
- Each PR gets a unique preview URL
- Preview persists until PR is merged/closed
- Perfect for testing before production

## Monitoring & Logs

### View Function Logs

1. Dashboard: **Functions** tab
2. Click any function name
3. View logs, invocations, and errors

### Check Deploy Status

```bash
# List recent deploys
netlify deploy:list

# View deploy logs
netlify deploy:logs
```

## Troubleshooting

### Build Failures

**"Cannot find module 'bcryptjs'"**
```bash
# Add to package.json dependencies if missing
npm install bcryptjs
git commit -am "Add bcryptjs dependency"
git push
```

**Environment Variables Not Loading**
- Verify all variables are set in Netlify dashboard
- Trigger manual redeploy: Dashboard → **Deploys** → **Trigger deploy** → **Deploy site**

### Authentication Issues

**"Invalid credentials" after deployment**
- Verify `ADMIN_PASSWORD_HASH` is correctly set
- Ensure no extra spaces or quotes around the hash
- Regenerate hash if needed and update environment variable

**401 Errors on API Requests**
- Check `AUTH_SECRET` matches between environments
- Verify JWT token isn't expired (24-hour lifetime)
- Clear browser localStorage and log in again

### Database Connection Issues

**"MongoServerError: Authentication failed"**
- Verify MongoDB username/password in `MONGODB_URI`
- Check Network Access settings in MongoDB Atlas
- Ensure connection string format is correct

**Timeout Errors**
- Check MongoDB Atlas network access allows Netlify IPs
- Verify database cluster is running
- Test connection string locally first

### Function Timeout

If operations take >10 seconds:
1. Check `netlify.toml` for function timeout setting
2. Default is 10s, maximum is 26s for free tier
3. Consider optimizing slow queries

## Rollback

### Rollback to Previous Deploy

1. Dashboard: **Deploys** tab
2. Find the working deploy
3. Click **...** menu → **Publish deploy**

```bash
# Via CLI
netlify deploy:rollback
```

## Security Best Practices

### Post-Deployment Checklist

- [ ] Test login with admin credentials
- [ ] Verify all CRUD operations work
- [ ] Check function logs for errors
- [ ] Test on mobile/tablet devices
- [ ] Enable HTTPS (auto-enabled by Netlify)
- [ ] Set up monitoring/alerts (optional)

### Regular Maintenance

- **Rotate AUTH_SECRET** every 90 days
- **Update password** and regenerate hash periodically
- **Monitor function logs** for suspicious activity
- **Review MongoDB access logs** regularly

## Cost Expectations

### Netlify Free Tier Includes:
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- HTTPS included
- Deploy previews

### MongoDB Atlas Free Tier:
- 512MB storage
- Shared cluster
- Suitable for personal projects

**Expected Monthly Cost**: $0 (within free tier limits for personal use)

## Support

### Getting Help

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **MongoDB Atlas Docs**: [docs.mongodb.com/atlas](https://docs.mongodb.com/atlas)
- **Next.js on Netlify**: [docs.netlify.com/frameworks/next-js](https://docs.netlify.com/frameworks/next-js)

### Project Issues

Report issues at: [GitHub Issues](https://github.com/roadlittledawn/website-author-career-data/issues)

---

**Deployment Checklist Summary**:

1. ✅ Generate password hash and AUTH_SECRET
2. ✅ Create Netlify site and connect GitHub repo
3. ✅ Add all 5 environment variables
4. ✅ Configure MongoDB network access
5. ✅ Deploy and test
6. ✅ Optional: Add custom domain
7. ✅ Set up continuous deployment

**You're ready to deploy!** 🚀
