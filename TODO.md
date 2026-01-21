# GraphQL API Migration - Complete

## ✅ Migration Complete

All CRUD operations now use the GraphQL API. The app is functional.

## 🔧 Data Migration Required

### 1. Profile Positioning
Old profiles have incompatible positioning structure. Edit profile through UI or run MongoDB migration:
```javascript
db.profiles.updateMany({}, {
  $set: {
    "positioning.headline": "",
    "positioning.summary": "",
    "positioning.targetRoles": [],
    "positioning.targetIndustries": []
  },
  $unset: { "positioning.current": "", "positioning.byRole": "" }
})
```

### 2. Skills roleRelevance
Old skills have array, new schema expects string. Edit through UI or migrate:
```javascript
db.skills.updateMany(
  { "roleRelevance": { $type: "array" } },
  [{ $set: { "roleRelevance": { $arrayElemAt: ["$roleRelevance", 0] } } }]
)
```

## 📋 Optional Future Work

1. **Achievements**: Update to use `metrics` string instead of `keywords` array
2. **Job Agent**: Implement AI features using GraphQL mutations

## 🚀 Environment Variables

```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://rndo54zjrsxy7ppxxobie7pgki0vlibt.lambda-url.us-west-2.on.aws/graphql
NEXT_PUBLIC_API_KEY=your-api-key
AUTH_SECRET=your-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=your-hash
MONGODB_URI=your-mongodb-uri
ANTHROPIC_API_KEY=your-key
```
