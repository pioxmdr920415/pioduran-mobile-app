#!/usr/bin/env python3
"""
Backend API Testing Script for Emergency Response System
Tests admin login functionality and basic API endpoints
"""

import requests
import sys
import json
from datetime import datetime

class EmergencyAPITester:
    def __init__(self, base_url="https://file-restore-4.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_user = None
        self.regular_user = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        if details:
            print(f"   Details: {details}")

    def test_health_endpoint(self):
        """Test the health endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}"
                if data.get('services', {}).get('database') == 'healthy':
                    details += ", Database: healthy"
                else:
                    details += f", Database: {data.get('services', {}).get('database', 'unknown')}"
            else:
                details = f"Status code: {response.status_code}"
                
            self.log_test("Health Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Health Endpoint", False, str(e))
            return False

    def test_admin_login(self):
        """Test admin login with admin/admin123"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = requests.post(
                f"{self.api_url}/auth/login", 
                json=login_data,
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.token = data.get('access_token')
                self.admin_user = data.get('user')
                
                # Verify admin role
                if self.admin_user and self.admin_user.get('role') == 'admin':
                    details = f"Role: {self.admin_user.get('role')}, Username: {self.admin_user.get('username')}"
                else:
                    success = False
                    details = f"Expected admin role, got: {self.admin_user.get('role') if self.admin_user else 'None'}"
            else:
                try:
                    error_data = response.json()
                    details = f"Status: {response.status_code}, Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details = f"Status: {response.status_code}, Response: {response.text[:100]}"
                    
            self.log_test("Admin Login (admin/admin123)", success, details)
            return success
            
        except Exception as e:
            self.log_test("Admin Login (admin/admin123)", False, str(e))
            return False

    def test_regular_user_login(self):
        """Test regular user login with testuser/test123"""
        try:
            login_data = {
                "username": "testuser",
                "password": "test123"
            }
            
            response = requests.post(
                f"{self.api_url}/auth/login", 
                json=login_data,
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                self.regular_user = data.get('user')
                
                # Verify user role
                if self.regular_user and self.regular_user.get('role') == 'user':
                    details = f"Role: {self.regular_user.get('role')}, Username: {self.regular_user.get('username')}"
                else:
                    success = False
                    details = f"Expected user role, got: {self.regular_user.get('role') if self.regular_user else 'None'}"
            else:
                try:
                    error_data = response.json()
                    details = f"Status: {response.status_code}, Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details = f"Status: {response.status_code}, Response: {response.text[:100]}"
                    
            self.log_test("Regular User Login (testuser/test123)", success, details)
            return success
            
        except Exception as e:
            self.log_test("Regular User Login (testuser/test123)", False, str(e))
            return False

    def test_protected_endpoint_with_token(self):
        """Test accessing protected endpoint with admin token"""
        if not self.token:
            self.log_test("Protected Endpoint Access", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(
                f"{self.api_url}/auth/me", 
                headers=headers,
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"User: {data.get('username')}, Role: {data.get('role')}"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Protected Endpoint Access", success, details)
            return success
            
        except Exception as e:
            self.log_test("Protected Endpoint Access", False, str(e))
            return False

    def test_incidents_endpoint(self):
        """Test incidents endpoint access"""
        if not self.token:
            self.log_test("Incidents Endpoint", False, "No admin token available")
            return False
            
        try:
            headers = {'Authorization': f'Bearer {self.token}'}
            response = requests.get(
                f"{self.api_url}/incidents", 
                headers=headers,
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Retrieved {len(data)} incidents"
            else:
                details = f"Status: {response.status_code}"
                
            self.log_test("Incidents Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Incidents Endpoint", False, str(e))
            return False

    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        try:
            login_data = {
                "username": "invalid",
                "password": "invalid"
            }
            
            response = requests.post(
                f"{self.api_url}/auth/login", 
                json=login_data,
                timeout=10
            )
            
            # Should fail with 401
            success = response.status_code == 401
            
            if success:
                details = "Correctly rejected invalid credentials"
            else:
                details = f"Expected 401, got {response.status_code}"
                
            self.log_test("Invalid Credentials Rejection", success, details)
            return success
            
        except Exception as e:
            self.log_test("Invalid Credentials Rejection", False, str(e))
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 50)
        
        # Test basic connectivity
        health_ok = self.test_health_endpoint()
        
        # Test authentication
        admin_login_ok = self.test_admin_login()
        user_login_ok = self.test_regular_user_login()
        
        # Test protected endpoints
        protected_ok = self.test_protected_endpoint_with_token()
        incidents_ok = self.test_incidents_endpoint()
        
        # Test security
        invalid_creds_ok = self.test_invalid_credentials()
        
        print("=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        # Determine overall success
        critical_tests = [health_ok, admin_login_ok]
        overall_success = all(critical_tests) and self.tests_passed >= (self.tests_run * 0.8)
        
        if overall_success:
            print("✅ Backend tests PASSED - Admin login working correctly")
        else:
            print("❌ Backend tests FAILED - Critical issues found")
            
        return {
            'success': overall_success,
            'passed': self.tests_passed,
            'total': self.tests_run,
            'admin_login_working': admin_login_ok,
            'health_check_working': health_ok,
            'admin_user': self.admin_user,
            'regular_user': self.regular_user
        }

def main():
    """Main test execution"""
    tester = EmergencyAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results['success'] else 1

if __name__ == "__main__":
    sys.exit(main())