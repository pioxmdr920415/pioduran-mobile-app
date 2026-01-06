import pytest
from fastapi.testclient import TestClient
from motor.motor_asyncio import AsyncIOMotorClient
import os
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

# Import the app and auth functions
from backend.server import app
from backend.auth import hash_password, verify_password, create_access_token

client = TestClient(app)

# Mock MongoDB for testing
@pytest.fixture
def mock_db():
    # Mock the database connection
    mock_client = MagicMock()
    mock_db = MagicMock()
    mock_client.__getitem__.return_value = mock_db

    with patch('backend.auth.client', mock_client), \
         patch('backend.auth.db', mock_db):
        yield mock_db

class TestAuthFunctions:
    def test_hash_password(self):
        password = "testpassword"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_verify_password(self):
        password = "testpassword"
        hashed = hash_password(password)
        assert verify_password(password, hashed)
        assert not verify_password("wrongpassword", hashed)

    def test_create_access_token(self):
        data = {"sub": "testuser"}
        token = create_access_token(data)
        assert isinstance(token, str)
        assert len(token) > 0

class TestAuthEndpoints:
    def test_register_success(self, mock_db):
        # Mock database operations
        mock_db.users.find_one.return_value = None
        mock_db.users.insert_one.return_value = MagicMock()

        user_data = {
            "username": "testuser",
            "password": "testpass123",
            "email": "test@example.com",
            "role": "user"
        }

        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 200
        assert response.json() == {"message": "User registered successfully"}

    def test_register_duplicate_username(self, mock_db):
        # Mock existing user
        mock_db.users.find_one.return_value = {"username": "testuser"}

        user_data = {
            "username": "testuser",
            "password": "testpass123",
            "email": "test@example.com"
        }

        response = client.post("/api/auth/register", json=user_data)
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]

    def test_login_success(self, mock_db):
        # Mock user lookup and password verification
        mock_user = {
            "username": "testuser",
            "hashed_password": hash_password("testpass123"),
            "role": "user"
        }
        mock_db.users.find_one.return_value = mock_user

        login_data = {
            "username": "testuser",
            "password": "testpass123"
        }

        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, mock_db):
        # Mock user not found
        mock_db.users.find_one.return_value = None

        login_data = {
            "username": "nonexistent",
            "password": "wrongpass"
        }

        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

    def test_login_wrong_password(self, mock_db):
        # Mock user with wrong password
        mock_user = {
            "username": "testuser",
            "hashed_password": hash_password("correctpass"),
            "role": "user"
        }
        mock_db.users.find_one.return_value = mock_user

        login_data = {
            "username": "testuser",
            "password": "wrongpass"
        }

        response = client.post("/api/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Invalid credentials" in response.json()["detail"]

class TestProtectedEndpoints:
    def get_auth_token(self, mock_db):
        # Helper to get auth token for protected endpoints
        mock_user = {
            "username": "testuser",
            "hashed_password": hash_password("testpass"),
            "role": "user",
            "id": "user123"
        }
        mock_db.users.find_one.return_value = mock_user

        login_response = client.post("/api/auth/login", json={
            "username": "testuser",
            "password": "testpass"
        })
        return login_response.json()["access_token"]

    def test_create_incident_report_success(self, mock_db):
        token = self.get_auth_token(mock_db)

        # Mock incident creation
        mock_db.incident_reports.insert_one.return_value = MagicMock()
        mock_db.incident_reports.find_one.return_value = {
            "id": "report123",
            "incidentType": "Fire",
            "fullName": "John Doe",
            "description": "Test fire incident",
            "status": "submitted",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        report_data = {
            "incidentType": "Fire",
            "fullName": "John Doe",
            "description": "Test fire incident",
            "phoneNumber": "09123456789",
            "location": {"lat": 14.6760, "lon": 121.0437},
            "address": "Test Address",
            "images": [],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "submitted",
            "priority": "medium"
        }

        response = client.post(
            "/api/incidents",
            json=report_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["incidentType"] == "Fire"
        assert data["fullName"] == "John Doe"

    def test_create_incident_report_unauthorized(self, mock_db):
        report_data = {
            "incidentType": "Fire",
            "fullName": "John Doe",
            "description": "Test fire incident"
        }

        response = client.post("/api/incidents", json=report_data)
        assert response.status_code == 401

    def test_get_incident_reports(self, mock_db):
        token = self.get_auth_token(mock_db)

        # Mock incident reports
        mock_reports = [
            {
                "id": "report1",
                "incidentType": "Fire",
                "fullName": "John Doe",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        mock_db.incident_reports.find.return_value.skip.return_value.limit.return_value.to_list.return_value = mock_reports

        response = client.get(
            "/api/incidents",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1

    def test_get_incident_report_by_id(self, mock_db):
        token = self.get_auth_token(mock_db)

        # Mock single incident report
        mock_report = {
            "id": "report123",
            "incidentType": "Fire",
            "fullName": "John Doe",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        mock_db.incident_reports.find_one.return_value = mock_report

        response = client.get(
            "/api/incidents/report123",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "report123"

    def test_update_incident_report_as_admin(self, mock_db):
        # Mock admin user
        mock_admin = {
            "username": "admin",
            "hashed_password": hash_password("adminpass"),
            "role": "admin",
            "id": "admin123"
        }
        mock_db.users.find_one.return_value = mock_admin

        login_response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "adminpass"
        })
        token = login_response.json()["access_token"]

        # Mock update operation
        mock_db.incident_reports.update_one.return_value.modified_count = 1
        mock_db.incident_reports.find_one.return_value = {
            "id": "report123",
            "status": "resolved",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        update_data = {
            "status": "resolved",
            "notes": "Issue resolved"
        }

        response = client.put(
            "/api/incidents/report123",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "resolved"

    def test_update_incident_report_forbidden(self, mock_db):
        token = self.get_auth_token(mock_db)  # Regular user

        update_data = {
            "status": "resolved"
        }

        response = client.put(
            "/api/incidents/report123",
            json=update_data,
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403

    def test_delete_incident_report_as_admin(self, mock_db):
        # Mock admin user
        mock_admin = {
            "username": "admin",
            "hashed_password": hash_password("adminpass"),
            "role": "admin",
            "id": "admin123"
        }
        mock_db.users.find_one.return_value = mock_admin

        login_response = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "adminpass"
        })
        token = login_response.json()["access_token"]

        # Mock delete operation
        mock_db.incident_reports.delete_one.return_value.deleted_count = 1

        response = client.delete(
            "/api/incidents/report123",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json() == {"message": "Report deleted successfully"}

    def test_delete_incident_report_forbidden(self, mock_db):
        token = self.get_auth_token(mock_db)  # Regular user

        response = client.delete(
            "/api/incidents/report123",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403