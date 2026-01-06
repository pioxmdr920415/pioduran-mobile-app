import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('/register');

    // Fill in the registration form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to login page
    await page.waitForURL('/login');

    // Verify we're on the login page
    await expect(page).toHaveURL('/login');

    // Check for success message (toast notification)
    await expect(page.locator('text=Account created!')).toBeVisible();
  });

  test('should show error for existing username', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('/register');

    // Fill in the registration form with existing username
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="email"]', 'another@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('text=Registration failed')).toBeVisible();
  });

  test('should show error for password mismatch', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('/register');

    // Fill in the registration form with mismatched passwords
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'differentpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for password mismatch error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('should show error for short password', async ({ page }) => {
    // Navigate to the registration page
    await page.goto('/register');

    // Fill in the registration form with short password
    await page.fill('input[name="username"]', 'newuser');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for password length error
    await expect(page.locator('text=Password must be at least 6 characters long')).toBeVisible();
  });
});