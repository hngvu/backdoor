# 🚪 Backdoor Proxy Server

A secure CORS proxy server deployed on Vercel to forward API requests from your frontend, bypassing CORS restrictions.

## 🎯 Purpose

This proxy server acts as a middleman between your frontend and third-party APIs that don't allow CORS requests. It:
- Forwards requests from your frontend to any target API
- Returns responses back to your client
- Prevents CORS errors
- Adds authentication layer with internal token

## 🚀 How It Works

```
Frontend → Backdoor Proxy → Target API
         ← Backdoor Proxy ← Target API
```

1. Frontend sends request to backdoor proxy with target URL encoded in path
2. Proxy validates internal token
3. Proxy forwards request to target API
4. Proxy returns response with CORS headers enabled

## 📋 Prerequisites

- Node.js 20.x or higher
- Vercel account for deployment
- Internal proxy token for authentication

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your internal token
INTERNAL_PROXY_KEY=your-secret-token-here
```

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "node-fetch": "^3.3.0",
  "dotenv": "^16.3.1"
}
```

## 🔧 Usage

### Local Development

```bash
# Uncomment app.listen() in server.js first
node server.js
```

### API Request Format

```
https://your-backdoor.vercel.app/{encoded-target-url}
```

#### Example:

**Target API:** `https://api.example.com/users/123`

**Proxy URL:** `https://your-backdoor.vercel.app/https://api.example.com/users/123`

### Frontend Integration

```javascript
// Using fetch
const response = await fetch(
  'https://your-backdoor.vercel.app/https://api.example.com/users/123',
  {
    method: 'GET',
    headers: {
      'X-Internal-Token': 'your-secret-token',
      'Content-Type': 'application/json'
    }
  }
);

// Using axios
const response = await axios.get(
  'https://your-backdoor.vercel.app/https://api.example.com/users/123',
  {
    headers: {
      'X-Internal-Token': 'your-secret-token'
    }
  }
);
```

### React/Vue Example

```typescript
const API_PROXY = 'https://your-backdoor.vercel.app';
const PROXY_TOKEN = import.meta.env.VITE_PROXY_TOKEN;

async function fetchData(targetUrl: string) {
  const proxyUrl = `${API_PROXY}/${targetUrl}`;
  
  const response = await fetch(proxyUrl, {
    headers: {
      'X-Internal-Token': PROXY_TOKEN,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}

// Usage
const data = await fetchData('https://api.example.com/data');
```

## 🚢 Deployment on Vercel

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Deploy

```bash
vercel
```

Or use Vercel's GitHub integration for automatic deployments.

### Step 3: Set Environment Variables

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add: `INTERNAL_PROXY_KEY` = `your-secret-token-here`
3. Redeploy if needed

## 🔒 Security

### Authentication

All requests require the `X-Internal-Token` header matching your `INTERNAL_PROXY_KEY`:

```javascript
headers: {
  'X-Internal-Token': 'your-secret-token'
}
```

### Security Best Practices

- ✅ Keep your `INTERNAL_PROXY_KEY` secret
- ✅ Use environment variables, never hardcode tokens
- ✅ Rotate tokens regularly
- ✅ Consider IP whitelisting for production
- ✅ Monitor usage and set rate limits if needed

### Optional: Add Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## 📝 Configuration

### `vercel.json`

```json
{
  "functions": {
    "api/server.js": {
      "runtime": "nodejs20.x"
    }
  },
  "routes": [
    { "src": "/(.*)", "dest": "/api/server.js" }
  ]
}
```

### Supported HTTP Methods

- `GET`
- `POST`
- `PUT`
- `PATCH`
- `DELETE`
- `OPTIONS` (CORS preflight)

## 🐛 Troubleshooting

### 403 Forbidden Error

**Problem:** Missing or invalid `X-Internal-Token`

**Solution:** Ensure you're sending the correct token in headers

### 400 Invalid Target URL

**Problem:** URL format is incorrect

**Solution:** Use full URL with protocol: `https://api.example.com/path`

### CORS Still Blocked

**Problem:** Browser caching old CORS policy

**Solution:** Clear browser cache or test in incognito mode

## 📊 Response Format

### Success Response

Returns the exact response from target API with added CORS headers.

### Error Response

```json
{
  "error": "Error description",
  "details": "Additional error information"
}
```

## 🔍 Monitoring

Check Vercel logs for request monitoring:

```bash
vercel logs
```

## 📄 License

MIT

## 🤝 Contributing

Feel free to open issues or submit pull requests.

## ⚠️ Disclaimer

This proxy server is for development and personal use. Be aware of:
- API terms of service of target APIs
- Rate limits on both proxy and target APIs
- Security implications of proxying requests
- Cost implications of Vercel usage

---

Made with ❤️ for bypassing CORS headaches
