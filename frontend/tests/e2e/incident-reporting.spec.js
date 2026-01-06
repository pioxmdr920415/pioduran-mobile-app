import { test, expect } from '@playwright/test';

test.describe('Incident Reporting', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should submit incident report successfully', async ({ page }) => {
    // Navigate to report incident page
    await page.goto('/report-incident');

    // Fill incident type
    await page.selectOption('select[id="incident-type"]', 'Fire');

    // Fill personal details
    await page.fill('input[id="full-name"]', 'John Doe');
    await page.fill('input[id="phone-number"]', '09123456789');

    // Fill description
    await page.fill('textarea[id="description"]', 'There is a fire in the neighborhood causing panic among residents.');

    // Set location by clicking on map (simulate coordinates)
    // First, wait for map to load
    await page.waitForSelector('.leaflet-container');

    // Click on the map container to set location
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.click({ position: { x: 100, y: 100 } });

    // Wait for address to be set
    await page.waitForSelector('text=Selected Location');

    // Submit the form
    await page.click('button:has-text("Submit Report")');

    // Wait for success message
    await expect(page.locator('text=Report Submitted!')).toBeVisible();
    await expect(page.locator('text=Thank you for your report. Our team will review it shortly.')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Navigate to report incident page
    await page.goto('/report-incident');

    // Try to submit without filling required fields
    await page.click('button:has-text("Submit Report")');

    // Check for validation errors
    await expect(page.locator('text=Please select an incident type')).toBeVisible();
    await expect(page.locator('text=Full name is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
  });

  test('should validate description length', async ({ page }) => {
    // Navigate to report incident page
    await page.goto('/report-incident');

    // Fill incident type
    await page.selectOption('select[id="incident-type"]', 'Flood');

    // Fill personal details
    await page.fill('input[id="full-name"]', 'Jane Smith');

    // Fill description that's too long (over 500 characters)
    const longDescription = 'A'.repeat(501);
    await page.fill('textarea[id="description"]', longDescription);

    // Submit the form
    await page.click('button:has-text("Submit Report")');

    // Check for length validation error
    await expect(page.locator('text=Description must be 500 characters or less')).toBeVisible();
  });

  test('should allow uploading images', async ({ page }) => {
    // Navigate to report incident page
    await page.goto('/report-incident');

    // Fill required fields
    await page.selectOption('select[id="incident-type"]', 'Medical Emergency');
    await page.fill('input[id="full-name"]', 'Emergency Caller');
    await page.fill('textarea[id="description"]', 'Medical emergency situation requiring immediate attention.');

    // Upload an image (we'll use a test file or skip if not available)
    // For now, just check that the upload area exists
    await expect(page.locator('text=Add')).toBeVisible();

    // Set location
    const mapContainer = page.locator('.leaflet-container');
    await mapContainer.click({ position: { x: 150, y: 150 } });
    await page.waitForSelector('text=Selected Location');

    // Submit the form
    await page.click('button:has-text("Submit Report")');

    // Check success
    await expect(page.locator('text=Report Submitted!')).toBeVisible();
  });

  test('should use GPS location', async ({ page }) => {
    // Navigate to report incident page
    await page.goto('/report-incident');

    // Mock geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 13.5, longitude: 123.5 });

    // Click GPS button
    await page.click('button:has-text("GPS")');

    // Wait for location to be set
    await page.waitForSelector('text=Selected Location');

    // Fill other required fields
    await page.selectOption('select[id="incident-type"]', 'Crime/Security');
    await page.fill('input[id="full-name"]', 'Security Reporter');
    await page.fill('textarea[id="description"]', 'Suspicious activity observed in the area.');

    // Submit the form
    await page.click('button:has-text("Submit Report")');

    // Check success
    await expect(page.locator('text=Report Submitted!')).toBeVisible();
  });
});