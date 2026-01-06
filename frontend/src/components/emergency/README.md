# AI Emergency Assistant Module

A comprehensive emergency response system designed for the MDRRMO Pio Duran application. This module provides AI-powered emergency assistance with full offline functionality support.

## Features

### 🤖 AI Chat Interface
- **Smart Emergency Detection**: Automatically detects emergency keywords and provides appropriate responses
- **Offline Mode**: Limited functionality when internet is unavailable
- **Voice Recognition**: Speech-to-text input for hands-free operation
- **Emergency Mode Integration**: Enhanced functionality during critical situations

### 📚 Comprehensive FAQ System
- **10 Emergency Categories**: Medical, Fire Safety, Natural Disasters, Home Safety, Transportation, First Aid, Evacuation, and more
- **Offline Access**: All critical information available without internet
- **Smart Search**: Filter and search emergency information by category or keyword
- **Severity Indicators**: Critical, High, and Medium priority classifications

### 📞 Emergency Contacts
- **Quick Dial**: One-tap calling to emergency services (117, 118)
- **Local Facilities**: Nearest hospitals, medical centers, and emergency services
- **Copy to Clipboard**: Easy access to emergency numbers
- **GPS Integration**: Get directions to medical facilities

### ♿ Accessibility Features
- **High Contrast Mode**: Improved visibility for low vision users
- **Large Text**: Increased text size for better readability
- **Screen Reader Support**: Optimized for assistive technologies
- **Audio Alerts**: Configurable sound notifications
- **Emergency Accessibility Guides**: Specific instructions for different disabilities

### 🚨 Emergency Mode
- **Critical Alerts**: Visual and audio notifications for emergencies
- **Quick Actions**: One-tap access to emergency services
- **Enhanced UI**: Simplified interface for high-stress situations
- **Auto-Accessibility**: Automatically enables accessibility features

## Technical Architecture

### Components Structure
```
frontend/src/components/emergency/
├── EmergencyFAQ.jsx          # FAQ system with offline support
├── EmergencyContacts.jsx     # Emergency contact management
├── EmergencyChat.jsx         # AI chat interface
├── EmergencyAccessibility.jsx # Accessibility features
└── README.md                # This documentation
```

### Integration Points
- **Main App**: Integrated into App.js routing system
- **Styling**: Custom emergency.css with animations and accessibility
- **Offline Support**: Comprehensive offline functionality testing
- **Navigation**: Integrated with existing bottom navigation

## Offline Functionality

### What Works Offline
- ✅ All FAQ information and search
- ✅ Emergency contact information
- ✅ Accessibility features
- ✅ Emergency mode functionality
- ✅ Basic UI navigation

### What Requires Internet
- ❌ AI chat responses (shows offline mode)
- ❌ GPS directions (shows offline message)
- ❌ Real-time updates

### Offline Testing
Use the comprehensive test suite in `frontend/src/utils/offlineTest.js`:

```javascript
import OfflineTestSuite from '../utils/offlineTest';

// Run all tests
const testSuite = new OfflineTestSuite();
testSuite.runAllTests();

// Get manual testing instructions
console.log(OfflineTestSuite.getManualTestInstructions());
```

## Emergency Response Flow

### 1. Detection Phase
- User inputs emergency keywords
- System detects emergency type (medical, fire, police, natural disaster)
- Emergency mode can be manually activated

### 2. Response Phase
- **Online**: AI provides detailed instructions and resources
- **Offline**: FAQ system provides pre-loaded emergency information
- **Critical**: Immediate connection to emergency services

### 3. Support Phase
- Contact information readily available
- Step-by-step instructions provided
- Accessibility features ensure universal access

## Emergency Keywords

The system recognizes these emergency keywords:
- **Medical**: "heart attack", "chest pain", "bleeding", "stroke", "unconscious"
- **Fire**: "fire", "smoke", "burning", "flames", "explosion"
- **Natural**: "earthquake", "typhoon", "flood", "landslide", "storm"
- **Safety**: "robbery", "assault", "attack", "danger", "help", "emergency"

## Accessibility Standards

### WCAG Compliance
- **Level A**: Basic accessibility requirements met
- **Level AA**: Enhanced accessibility for broader user base
- **Level AAA**: Maximum accessibility (where applicable)

### Features for Different Disabilities
- **Visual Impairment**: High contrast, screen reader support, large text
- **Hearing Impairment**: Visual alerts, text-based information
- **Motor Impairment**: Large touch targets, voice commands, simplified navigation
- **Cognitive**: Clear instructions, simplified interface, emergency guides

## Usage Examples

### Basic Usage
```jsx
import AIEmergencyAssistant from './pages/AIEmergencyAssistant';

// Navigate to emergency assistant
<Link to="/ai-emergency-assistant">Emergency Assistant</Link>
```

### Emergency Mode Activation
```jsx
// In emergency situations, users can:
// 1. Click "Activate Emergency Mode"
// 2. System automatically enables accessibility features
// 3. Quick actions become prominent
// 4. Emergency contacts are easily accessible
```

### Offline Usage
```jsx
// When offline, the system:
// 1. Shows offline status indicator
// 2. Disables AI chat functionality
// 3. Enables FAQ and contact features
// 4. Provides offline emergency information
```

## Emergency Numbers (Philippines)

### National Emergency Numbers
- **117**: Police, Fire, and Medical Emergency
- **118**: Fire Department and Ambulance
- **119**: Additional emergency services

### Local Numbers (Pio Duran, Albay)
- **MDRRMO**: (052) 123-4567
- **Pio Duran District Hospital**: (052) 123-4567
- **Albay Provincial Hospital**: (052) 742-1234
- **Bicol Medical Center**: (052) 820-1234

## Development Notes

### Adding New FAQ Entries
```javascript
// In EmergencyFAQ.jsx, add to faqData array:
{
  id: 11,
  category: 'new_category',
  title: 'New Emergency Topic',
  icon: NewIcon,
  content: `Detailed emergency instructions...`,
  severity: 'high', // 'critical', 'high', 'medium'
  offline: true // Must be true for offline access
}
```

### Adding New Emergency Contacts
```javascript
// In EmergencyContacts.jsx, add to emergencyServices array:
{
  id: 'new_service',
  name: 'New Service Name',
  number: 'NEW_NUMBER',
  icon: NewIcon,
  color: 'bg-color-class',
  description: 'Service description',
  priority: 'high', // 'critical', 'high', 'medium'
  available: '24/7'
}
```

### Adding New Accessibility Features
```javascript
// In EmergencyAccessibility.jsx, add to accessibilityFeatures array:
{
  id: 'new_feature',
  label: 'Feature Name',
  description: 'Feature description',
  icon: FeatureIcon,
  action: () => handleFeatureToggle(),
  enabled: featureState
}
```

## Testing

### Automated Testing
Run the offline test suite:
```bash
# In browser console
const testSuite = new window.OfflineTestSuite();
testSuite.runAllTests();
```

### Manual Testing
1. Enable airplane mode
2. Navigate through all features
3. Verify offline functionality
4. Test emergency mode
5. Check accessibility features

### Performance Testing
- **Load Time**: < 3 seconds for initial load
- **Offline Access**: < 1 second for FAQ access
- **Emergency Mode**: < 0.5 seconds for activation

## Security Considerations

### Data Privacy
- No personal data stored locally
- Emergency information is read-only
- Contact information is static and pre-configured

### Emergency Integrity
- Critical emergency numbers are hardcoded
- No internet dependency for essential functions
- Backup information available offline

## Future Enhancements

### Planned Features
- [ ] GPS location detection for nearest facilities
- [ ] Emergency broadcast system integration
- [ ] Multi-language support
- [ ] Emergency kit checklist generator
- [ ] Family emergency plan builder

### Integration Opportunities
- [ ] Weather alert system integration
- [ ] Local government emergency services API
- [ ] Hospital bed availability system
- [ ] Emergency vehicle tracking

## Support

For issues, questions, or feature requests:
1. Check the FAQ section in the application
2. Review this documentation
3. Contact the development team
4. Report bugs through the application feedback system

---

**Note**: This emergency assistant is designed to provide information and support. In life-threatening emergencies, always call the appropriate emergency services immediately.