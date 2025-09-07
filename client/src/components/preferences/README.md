# Preferences Module

A well-organized, feature-rich preferences system for the Bingeboard application.

## 🏗️ Folder Structure

```
client/src/
├── components/preferences/
│   ├── PreferencesPanel.tsx      # Main preferences modal component
│   ├── constants.ts              # Static data (genres, viewing options, animations)
│   └── index.ts                  # Clean export interface
├── lib/
│   └── preferences.ts            # Business logic & API interactions
├── types/
│   └── preferences.ts            # TypeScript type definitions
├── firebase/
│   └── config.ts                 # Firebase configuration (existing)
└── hooks/
    └── useAuth.ts                # Authentication hook (existing)
```

## 🔥 Features

### ✅ **Multi-Storage Architecture**
- **Primary**: Firebase Firestore with setDoc/updateDoc
- **Secondary**: Backend API (/api/user/preferences)  
- **Fallback**: localStorage for offline users

### ✅ **React Query Integration**
- useMutation for saving with proper loading states
- Query invalidation for cache management
- Error handling with fallback strategies

### ✅ **Framer Motion Animations**
- Smooth modal entrance/exit animations
- Staggered reveal for genre buttons
- Spring animations for check marks
- Coordinated AnimatePresence

### ✅ **Type Safety**
- Comprehensive TypeScript interfaces
- Centralized type definitions
- Validation utilities

## 🎯 Usage

### Basic Usage
```tsx
import { PreferencesPanel } from '@/components/preferences';

function Dashboard() {
  const [showPreferences, setShowPreferences] = useState(false);
  
  const handleSavePreferences = (preferences) => {
    console.log('Preferences saved:', preferences);
  };

  return (
    <div>
      <button onClick={() => setShowPreferences(true)}>
        Open Preferences
      </button>
      
      <PreferencesPanel
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePreferences}
      />
    </div>
  );
}
```

### Advanced Usage with Service
```tsx
import { PreferencesService } from '@/lib/preferences';
import type { UserPreferences } from '@/types/preferences';

// Load preferences
const result = await PreferencesService.loadPreferences(userId);
if (result.success) {
  console.log('Loaded from:', result.source);
  console.log('Preferences:', result.preferences);
}

// Save preferences
const preferences: UserPreferences = {
  favoriteGenres: [28, 35, 18], // Action, Comedy, Drama
  viewingStyle: ['binge-worthy', 'highly-rated'],
  defaultRecommendationMode: 'ai'
};

const saveResult = await PreferencesService.savePreferences(
  userId,
  userEmail,
  preferences
);
```

## 🛠️ API Endpoints

The preferences system expects these backend endpoints:

### GET /api/user/preferences
```json
{
  "success": true,
  "preferences": {
    "favoriteGenres": [28, 35, 18],
    "viewingStyle": ["binge-worthy"],
    "defaultRecommendationMode": "ai"
  }
}
```

### POST /api/user/preferences
```json
{
  "userId": "user123",
  "preferences": {
    "favoriteGenres": [28, 35, 18],
    "viewingStyle": ["binge-worthy"],
    "defaultRecommendationMode": "ai"
  }
}
```

## 🗄️ Data Storage

### Firestore Document Structure
```
userPreferences/{userId}
├── userId: string
├── userEmail: string
├── preferences: {
│   ├── favoriteGenres: number[]
│   ├── viewingStyle: string[]
│   └── defaultRecommendationMode: string
│ }
├── createdAt: Date
└── updatedAt: Date
```

### localStorage Fallback
```json
{
  "favoriteGenres": [28, 35, 18],
  "viewingStyle": ["binge-worthy"],
  "defaultRecommendationMode": "ai"
}
```

## 🎨 Animations

The component uses Framer Motion with these key animations:

- **Modal Entrance**: Backdrop fade + content scale/slide
- **Genre Buttons**: Staggered reveal with scale animation
- **Check Marks**: Spring animation with rotation
- **Loading States**: Spinner with disabled button states

## 🔧 Customization

### Adding New Genres
Edit `client/src/components/preferences/constants.ts`:
```tsx
export const GENRES: Genre[] = [
  { id: 99, name: "Documentary" },
  // ... existing genres
];
```

### Adding New Viewing Preferences
```tsx
export const VIEWING_PREFERENCES: ViewingPreference[] = [
  { 
    id: 'international', 
    title: 'International content', 
    desc: 'Shows and movies from around the world' 
  },
  // ... existing preferences
];
```

## 🚀 Benefits of This Structure

1. **Separation of Concerns**: UI, business logic, and types are separate
2. **Maintainability**: Easy to modify individual pieces
3. **Reusability**: Service can be used outside the modal
4. **Type Safety**: Comprehensive TypeScript coverage
5. **Testability**: Each module can be tested independently
6. **Scalability**: Easy to add new storage backends or features

This structure follows React/TypeScript best practices and makes the preferences system highly maintainable and extensible.
