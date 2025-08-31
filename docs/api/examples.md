# NOVELI.SH API Examples

## 🎯 **Epic 1 Achievement Status (August 2025)**

### ✅ **V1 Foundation Complete**
- **13 V1 Agents Archived**: Safe transition with full code preservation (3,827 lines)
- **API Examples Foundation**: Comprehensive examples created as part of V1 API documentation
- **100% Success Rate**: Epic → Stories → Tasks → PR → Merge workflow with complete API specifications
- **Enterprise Foundation**: API examples ready for production implementation in Epic 3

### 🚀 **V2 Transition Ready**
- **Intelligence Evolution**: From automation to GitHub Copilot + Claude 4 intelligence
- **API Intelligence**: V2 will include intelligent API examples with adaptive response patterns
- **Production Infrastructure**: All API patterns proven and ready for intelligent enhancement
- **Epic 2 Foundation**: Intelligent API examples with GitHub Copilot-generated scenarios

This document provides example requests and responses for the NOVELI.SH API.

## Authentication Flow

### 1. User Registration
```bash
curl -X POST https://api.noveli.sh/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "storyteller",
    "password": "SecurePassword123!",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe"
  }'
```

Response:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "storyteller",
  "email": "user@example.com",
  "verificationRequired": true
}
```

### 2. User Login
```bash
curl -X POST https://api.noveli.sh/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "username": "storyteller",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": "standard-user",
    "subscriptionTier": "trial"
  }
}
```

## Story Generation Flow

### 1. Start New Story
```bash
curl -X POST https://api.noveli.sh/v1/story/start \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "seed": "A mysterious door appears in the subway station",
    "genre": "mystery",
    "maxLength": 150
  }'
```

Response:
```json
{
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "beatNumber": 1,
  "content": {
    "text": "The fluorescent lights flicker as you wait for the late train. That's when you notice it—a door that wasn't there this morning, tucked between two advertising posters. The brass handle gleams despite the station's perpetual grime. Something about it pulls at you, whispering promises of elsewhere.",
    "title": "The Door Between",
    "mood": "mysterious",
    "setting": "subway station",
    "characters": ["protagonist"]
  },
  "choices": [
    {
      "choiceId": "approach-door",
      "text": "Approach the mysterious door carefully",
      "consequence": "unknown",
      "riskLevel": "medium"
    },
    {
      "choiceId": "ignore-door",
      "text": "Ignore the door and wait for your train",
      "consequence": "neutral",
      "riskLevel": "low"
    },
    {
      "choiceId": "ask-others",
      "text": "Ask other passengers if they see the door",
      "consequence": "neutral",
      "riskLevel": "low"
    }
  ],
  "metadata": {
    "aiModel": "bedrock",
    "generationTime": 1250,
    "qualityScore": 0.87,
    "genre": "mystery",
    "complexity": "moderate"
  }
}
```

### 2. Continue Story
```bash
curl -X POST https://api.noveli.sh/v1/story/continue \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "choiceId": "approach-door"
  }'
```

Response:
```json
{
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "beatNumber": 2,
  "content": {
    "text": "Your footsteps echo as you cross the platform. Up close, the door seems to hum with an energy that makes your teeth ache. The brass handle is warm to the touch—impossibly warm for this cold station. As your fingers close around it, you hear a soft click. The door is unlocked.",
    "title": "The Threshold",
    "mood": "tense",
    "setting": "subway station, mysterious door",
    "characters": ["protagonist"]
  },
  "choices": [
    {
      "choiceId": "open-door",
      "text": "Turn the handle and open the door",
      "consequence": "unknown",
      "riskLevel": "high"
    },
    {
      "choiceId": "step-back",
      "text": "Step back from the door immediately",
      "consequence": "neutral",
      "riskLevel": "low"
    },
    {
      "choiceId": "listen-first",
      "text": "Listen carefully at the door before opening",
      "consequence": "positive",
      "riskLevel": "medium"
    }
  ],
  "metadata": {
    "aiModel": "bedrock",
    "generationTime": 1180,
    "qualityScore": 0.91,
    "genre": "mystery",
    "complexity": "moderate"
  }
}
```

## User Management

### Update User Preferences
```bash
curl -X POST https://api.noveli.sh/v1/user/preferences \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "aiModel": "claude",
    "storyGenre": ["mystery", "sci-fi"],
    "accessibility": {
      "fontSize": "large",
      "highContrast": true,
      "screenReader": false,
      "reducedMotion": false
    },
    "analytics": true
  }'
```

### Get Story Session
```bash
curl -X GET https://api.noveli.sh/v1/story/session/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Analytics (Admin Only)

### Record Analytics Event
```bash
curl -X POST https://api.noveli.sh/v1/analytics/event \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "choice_made",
    "sessionId": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-01T12:00:00Z",
    "properties": {
      "choiceId": "approach-door",
      "beatNumber": 1,
      "responseTime": 5000
    },
    "platform": "web"
  }'
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## Rate Limiting

- Authentication endpoints: 10 requests per minute per IP
- Story generation: 20 requests per minute per user
- User management: 60 requests per minute per user
- Analytics: 100 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
X-RateLimit-Reset: 1640995200
```