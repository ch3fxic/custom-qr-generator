# API Documentation

Complete API reference for the Custom QR Generator backend.

## Base URL

**Development:** `http://localhost:3000`
**Production:** `https://your-backend-url.com`

## Authentication

Currently, the API does not require authentication. For production use, consider adding API keys or authentication.

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-12T10:30:00.000Z",
  "uptime": 12345.67
}
```

**Status Codes:**
- `200 OK` - Service is healthy

---

### Create QR Code

Create a new QR code with tracking URL.

**Endpoint:** `POST /api/create`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "styleOptions": {
    "fgColor": "#000000",
    "bgColor": "#ffffff",
    "dotStyle": "square",
    "cornerStyle": "square",
    "useGradient": false,
    "gradientColor1": "#667eea",
    "gradientColor2": "#764ba2"
  }
}
```

**Parameters:**
- `url` (string, required) - The destination URL or text content
- `styleOptions` (object, optional) - QR code styling options

**Response:**
```json
{
  "success": true,
  "shortId": "abc123XY",
  "trackingUrl": "http://localhost:3000/r/abc123XY",
  "originalUrl": "https://example.com",
  "message": "QR code created successfully"
}
```

**Status Codes:**
- `200 OK` - QR code created successfully
- `400 Bad Request` - Invalid URL or parameters
- `500 Internal Server Error` - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/create \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "styleOptions": {
      "fgColor": "#000000",
      "bgColor": "#ffffff"
    }
  }'
```

---

### Redirect and Track

Redirect to original URL and record the scan.

**Endpoint:** `GET /r/:id`

**Parameters:**
- `id` (string, required) - The short QR code ID

**Response:**
- HTTP 302 redirect to the original URL

**Status Codes:**
- `302 Found` - Redirect to original URL
- `400 Bad Request` - Invalid ID format
- `404 Not Found` - QR code not found
- `500 Internal Server Error` - Server error

**Example:**
```
GET http://localhost:3000/r/abc123XY
→ Redirects to https://example.com
```

**What happens:**
1. Validates the QR code ID
2. Records scan with timestamp, IP, and user-agent
3. Redirects user to original URL

---

### Get Analytics

Get detailed analytics for a specific QR code.

**Endpoint:** `GET /api/stats/:id`

**Parameters:**
- `id` (string, required) - The short QR code ID

**Response:**
```json
{
  "success": true,
  "id": "abc123XY",
  "originalUrl": "https://example.com",
  "styleOptions": {
    "fgColor": "#000000",
    "bgColor": "#ffffff"
  },
  "createdAt": "2025-11-12T10:30:00.000Z",
  "totalScans": 42,
  "uniqueScans": 28,
  "scans": [
    {
      "timestamp": "2025-11-12T11:00:00.000Z",
      "ip": "192.168.1.1",
      "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
    }
  ]
}
```

**Status Codes:**
- `200 OK` - Analytics retrieved successfully
- `404 Not Found` - QR code not found
- `500 Internal Server Error` - Server error

**Example cURL:**
```bash
curl http://localhost:3000/api/stats/abc123XY
```

---

### List All QR Codes (Optional)

Get a list of all QR codes with basic stats.

**Endpoint:** `GET /api/list`

**Query Parameters:**
- `limit` (number, optional) - Maximum number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "qrCodes": [
    {
      "id": "abc123XY",
      "original_url": "https://example.com",
      "created_at": "2025-11-12T10:30:00.000Z",
      "scan_count": 42
    }
  ]
}
```

**Status Codes:**
- `200 OK` - List retrieved successfully
- `500 Internal Server Error` - Server error

**Example cURL:**
```bash
curl http://localhost:3000/api/list?limit=20
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

**Common Error Messages:**
- `"Valid URL is required"` - URL parameter missing or invalid
- `"Invalid URL format"` - URL is not a valid format
- `"QR code not found"` - Requested QR code doesn't exist
- `"Too many requests, please try again later"` - Rate limit exceeded
- `"Not allowed by CORS"` - Request from unauthorized origin

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

**Default Limits:**
- **Window:** 15 minutes
- **Max Requests:** 100 per IP address

**Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1699876543
```

**Rate Limit Response:**
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

**Status Code:** `429 Too Many Requests`

---

## CORS

The API supports Cross-Origin Resource Sharing (CORS).

**Allowed Origins:**
- Configured via `FRONTEND_URL` environment variable
- Development: `localhost` variations automatically allowed

**Allowed Methods:**
- GET
- POST
- PUT
- DELETE
- OPTIONS

**Allowed Headers:**
- Content-Type
- Authorization

---

## Database Schema

### Table: `qr_codes`

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key, short ID |
| original_url | TEXT | The destination URL |
| style_options | TEXT | JSON string of style options |
| created_at | DATETIME | Timestamp of creation |

### Table: `scans`

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| qr_id | TEXT | Foreign key to qr_codes.id |
| timestamp | DATETIME | When the scan occurred |
| ip | TEXT | IP address of scanner |
| user_agent | TEXT | Browser user-agent string |

---

## Code Examples

### JavaScript (Fetch API)

```javascript
// Create QR Code
async function createQRCode(url) {
  const response = await fetch('http://localhost:3000/api/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: url,
      styleOptions: {
        fgColor: '#000000',
        bgColor: '#ffffff'
      }
    })
  });
  
  const data = await response.json();
  return data;
}

// Get Analytics
async function getAnalytics(id) {
  const response = await fetch(`http://localhost:3000/api/stats/${id}`);
  const data = await response.json();
  return data;
}
```

### Python (Requests)

```python
import requests

# Create QR Code
def create_qr_code(url):
    response = requests.post(
        'http://localhost:3000/api/create',
        json={
            'url': url,
            'styleOptions': {
                'fgColor': '#000000',
                'bgColor': '#ffffff'
            }
        }
    )
    return response.json()

# Get Analytics
def get_analytics(qr_id):
    response = requests.get(f'http://localhost:3000/api/stats/{qr_id}')
    return response.json()
```

### cURL

```bash
# Create QR Code
curl -X POST http://localhost:3000/api/create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Get Analytics
curl http://localhost:3000/api/stats/abc123XY

# List QR Codes
curl http://localhost:3000/api/list?limit=10
```

---

## Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Create and Test Flow
```bash
# 1. Create QR code
RESPONSE=$(curl -s -X POST http://localhost:3000/api/create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}')

# 2. Extract short ID
SHORT_ID=$(echo $RESPONSE | jq -r '.shortId')

# 3. Test redirect (should redirect to example.com)
curl -L http://localhost:3000/r/$SHORT_ID

# 4. Check analytics
curl http://localhost:3000/api/stats/$SHORT_ID
```

---

## Best Practices

1. **Always validate URLs** before sending to the API
2. **Handle errors gracefully** with try-catch blocks
3. **Cache QR codes** when possible to reduce API calls
4. **Monitor rate limits** to avoid being blocked
5. **Use HTTPS** in production
6. **Store short IDs** for later analytics retrieval

---

## Changelog

### v1.0.0 (2025-11-12)
- Initial API release
- Basic QR code creation and tracking
- Analytics endpoints
- Rate limiting
- CORS support

---

For questions or issues, please check the main README.md or open an issue on GitHub.
