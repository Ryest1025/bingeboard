# BingeBoard Testing Suite

This directory contains unit, integration, and end-to-end tests for the BingeBoard application.

## 📁 Test Structure

```
tests/
├── components/     # Component unit tests
├── pages/          # Page integration tests  
├── api/           # API endpoint tests
├── utils/         # Utility function tests
└── e2e/           # End-to-end tests
```

## 🛠️ Test Setup

### Prerequisites
- Node.js 18+
- Test dependencies installed via npm

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ComponentName.test.tsx
```

## 🧪 Test Categories

### Unit Tests (`*.test.tsx`)
- Component rendering and behavior
- Utility function validation
- Hook functionality
- Individual API functions

### Integration Tests (`*.integration.test.tsx`)
- Page functionality
- Component interactions
- API endpoint integration
- Authentication flows

### End-to-End Tests (`*.e2e.test.tsx`)
- Complete user workflows
- Authentication scenarios
- Mobile responsiveness
- Cross-browser compatibility

## 📋 Test Conventions

### File Naming
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `FeatureName.integration.test.tsx`
- E2E tests: `UserFlow.e2e.test.tsx`

### Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
  });

  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interactions', () => {
    // Test implementation
  });
});
```

### Mock Data
- Use realistic test data that matches production schemas
- Store mock data in `tests/mocks/` directory
- Avoid placeholder or synthetic data

## 🔄 CI/CD Integration

Tests are automatically run on:
- Pull requests
- Main branch commits
- Pre-deployment builds

## 📊 Coverage Goals

- **Components**: 90%+ coverage
- **Pages**: 80%+ coverage
- **API Routes**: 95%+ coverage
- **Utilities**: 100% coverage

## 🐛 Debugging Tests

### Common Issues
1. **Authentication**: Use mock authentication in tests
2. **API Calls**: Mock external API responses
3. **Environment**: Set test environment variables
4. **Database**: Use test database or mocks

### Debug Commands
```bash
# Run with verbose output
npm test -- --verbose

# Run specific test with debug
npm test -- --debug ComponentName.test.tsx

# Run with coverage report
npm run test:coverage -- --reporter=html
```

## 📝 Writing New Tests

1. **Create test file** in appropriate directory
2. **Import testing utilities** (React Testing Library, Jest)
3. **Write descriptive test names** that explain expected behavior
4. **Use realistic test data** from actual API responses
5. **Test both happy path and error scenarios**
6. **Update this README** if adding new test categories

## 🔗 Testing Tools

- **Jest**: Test runner and assertions
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for integration tests
- **Cypress**: End-to-end testing framework
- **Testing Library User Event**: User interaction simulation

## 📚 Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)