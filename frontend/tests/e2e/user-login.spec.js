import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Fill in the login form
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/dashboard');

    // Check for success message
    await expect(page.locator('text=Welcome back!')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Fill in the login form with wrong password
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'wrongpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('text=Login failed')).toBeVisible();
  });

  test('should show error for non-existent user', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Fill in the login form with non-existent user
    await page.fill('input[name="username"]', 'nonexistentuser');
    await page.fill('input[name="password"]', 'password123');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('text=Login failed')).toBeVisible();
  });

  test('should navigate to register page from login page', async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');

    // Click the register link
    await page.click('text=Sign up here');

    // Verify navigation to register page
    await expect(page).toHaveURL('/register');
  });
});