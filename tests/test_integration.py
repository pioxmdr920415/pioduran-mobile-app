import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

from backend.server import app
from backend.auth import hash_password

client = TestClient(app)

class TestFullWorkflows:
    @patch('backend.server.db')
    @patch('backend.auth.db')
    def test_complete_user_registration_and_login_flow(self, mock_auth_db, mock_server_db):
        """Test the complete flow: register -> login -> access protected endpoint"""

        # Step 1: Register a new user
        user_data = {
            "username": "integration_test_user",
            "password": "testpass123",
            "email": "integration@test.com",
            "role": "user"
        }

        # Mock that user doesn't exist
        mock_auth_db.users.find_one.return_value = None
        mock_auth_db.users.insert_one.return_value = MagicMock()

        register_response = client.post("/api/auth/register", json=user_data)
        assert register_response.status_code == 200
        assert register_response.json() == {"message": "User registered successfully"}

        # Step 2: Login with the registered user
        login_data = {
            "username": "integration_test_user",
            "password": "testpass123"
        }

        # Mock user lookup for login
        mock_user = {
            "username": "integration_test_user",
            "hashed_password": hash_password("testpass123"),
            "role": "user",
            "id": "integration_user_123"
        }
        mock_auth_db.users.find_one.return_value = mock_user

        login_response = client.post("/api/auth/login", json=login_data)
        assert login_response.status_code == 200

        login_data_response = login_response.json()
        assert "access_token" in login_data_response
        assert login_data_response["token_type"] == "bearer"

        access_token = login_data_response["access_token"]

        # Step 3: Access a protected endpoint with the token
        headers = {"Authorization": f"Bearer {access_token}"}

        # Mock incident reports for the user
        mock_incidents = [
            {
                "id": "incident1",
                "incidentType": "Fire",
                "fullName": "integration_test_user",
                "description": "Test fire incident",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]

        mock_cursor = MagicMock()
        mock_cursor.skip.return_value.limit.return_value.to_list.return_value = mock_incidents
        mock_server_db.incident_reports.find.return_value = mock_cursor

        incidents_response = client.get("/api/incidents", headers=headers)
        assert incidents_response.status_code == 200

        incidents_data = incidents_response.json()
        assert isinstance(incidents_data, list)

    @patch('backend.server.db')
    @patch('backend.auth.db')
    def test_incident_reporting_workflow(self, mock_auth_db, mock_server_db):
        """Test the complete incident reporting workflow"""

        # First, get authenticated
        mock_user = {
            "username": "reporter",
            "hashed_password": hash_password("reporterpass"),
            "role": "user",
            "id": "reporter123"
        }
        mock_auth_db.users.find_one.return_value = mock_user

        login_response = client.post("/api/auth/login", json={
            "username": "reporter",
            "password": "reporterpass"
        })
        access_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {access_token}"}

        # Step 1: Create an incident report
        incident_data = {
            "incidentType": "Medical Emergency",
            "fullName": "John Doe",
            "phoneNumber": "09123456789",
            "description": "Medical emergency at downtown area",
            "images": ["image1.jpg", "image2.jpg"],
            "location": {"lat": 14.6760, "lon": 121.0437},
            "address": "123 Main St, Downtown",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "submitted",
            "priority": "high"
        }

        # Mock incident creation
        mock_server_db.incident_reports.insert_one.return_value = MagicMock(inserted_id="incident123")
        mock_server_db.incident_reports.find_one.return_value = {
            "id": "incident123",
            **incident_data,
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        create_response = client.post("/api/incidents", json=incident_data, headers=headers)
        assert create_response.status_code == 200

        created_incident = create_response.json()
        assert created_incident["incidentType"] == "Medical Emergency"
        assert created_incident["id"] == "incident123"

        # Step 2: Retrieve the incident report
        mock_server_db.incident_reports.find_one.return_value = created_incident

        get_response = client.get("/api/incidents/incident123", headers=headers)
        assert get_response.status_code == 200

        retrieved_incident = get_response.json()
        assert retrieved_incident["id"] == "incident123"
        assert retrieved_incident["description"] == "Medical emergency at downtown area"

        # Step 3: Update the incident (as responder/admin)
        # Mock admin user for update
        mock_admin = {
            "username": "admin",
            "hashed_password": hash_password("adminpass"),
            "role": "admin",
            "id": "admin123"
        }
        mock_auth_db.users.find_one.return_value = mock_admin

        admin_login = client.post("/api/auth/login", json={
            "username": "admin",
            "password": "adminpass"
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        update_data = {
            "status": "in_progress",
            "assigned_to": "responder1",
            "priority": "critical",
            "notes": "Assigned to emergency response team"
        }

        # Mock update operation
        mock_server_db.incident_reports.update_one.return_value.modified_count = 1
        mock_server_db.incident_reports.find_one.return_value = {
            **created_incident,
            **update_data,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "updated_by": "admin"
        }

        update_response = client.put("/api/incidents/incident123", json=update_data, headers=admin_headers)
        assert update_response.status_code == 200

        updated_incident = update_response.json()
        assert updated_incident["status"] == "in_progress"
        assert updated_incident["assigned_to"] == "responder1"

    @patch('backend.server.db')
    def test_status_check_workflow(self, mock_db):
        """Test status check creation and retrieval"""

        # Step 1: Create multiple status checks
        status_checks = [
            {"client_name": "Mobile App v1.0"},
            {"client_name": "Web Dashboard"},
            {"client_name": "Emergency Hotline System"}
        ]

        created_checks = []
        for status_data in status_checks:
            mock_db.status_checks.insert_one.return_value = MagicMock()

            response = client.post("/api/status", json=status_data)
            assert response.status_code == 200

            created_check = response.json()
            created_checks.append(created_check)
            assert created_check["client_name"] == status_data["client_name"]

        # Step 2: Retrieve all status checks
        mock_cursor = MagicMock()
        mock_cursor.to_list.return_value = created_checks
        mock_db.status_checks.find.return_value = mock_cursor

        get_response = client.get("/api/status")
        assert get_response.status_code == 200

        retrieved_checks = get_response.json()
        assert len(retrieved_checks) == len(status_checks)

        # Verify all client names are present
        client_names = [check["client_name"] for check in retrieved_checks]
        assert "Mobile App v1.0" in client_names
        assert "Web Dashboard" in client_names
        assert "Emergency Hotline System" in client_names

    @patch('backend.server.db')
    @patch('backend.auth.db')
    def test_user_reports_workflow(self, mock_auth_db, mock_server_db):
        """Test getting user-specific reports"""

        # Authenticate as a user
        mock_user = {
            "username": "report_user",
            "hashed_password": hash_password("userpass"),
            "role": "user",
            "id": "user123"
        }
        mock_auth_db.users.find_one.return_value = mock_user

        login_response = client.post("/api/auth/login", json={
            "username": "report_user",
            "password": "userpass"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Mock user reports
        user_reports = [
            {
                "id": "report1",
                "fullName": "report_user",
                "incidentType": "Fire",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "report2",
                "fullName": "report_user",
                "incidentType": "Medical",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]

        mock_server_db.incident_reports.find.return_value.to_list.return_value = user_reports

        # Get user reports
        response = client.get("/api/incidents/user/report_user", headers=headers)
        assert response.status_code == 200

        reports = response.json()
        assert len(reports) == 2
        assert all(report["fullName"] == "report_user" for report in reports)

    @patch('backend.server.db')
    @patch('backend.auth.db')
    def test_admin_workflow(self, mock_auth_db, mock_server_db):
        """Test admin-specific operations"""

        # Login as admin
        mock_admin = {
            "username": "superadmin",
            "hashed_password": hash_password("adminpass"),
            "role": "admin",
            "id": "admin123"
        }
        mock_auth_db.users.find_one.return_value = mock_admin

        login_response = client.post("/api/auth/login", json={
            "username": "superadmin",
            "password": "adminpass"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Test deleting an incident report
        mock_server_db.incident_reports.delete_one.return_value.deleted_count = 1

        delete_response = client.delete("/api/incidents/report123", headers=headers)
        assert delete_response.status_code == 200
        assert delete_response.json() == {"message": "Report deleted successfully"}

        # Test getting all reports with filters
        mock_reports = [
            {
                "id": "report1",
                "status": "submitted",
                "priority": "high",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "report2",
                "status": "resolved",
                "priority": "low",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]

        mock_cursor = MagicMock()
        mock_cursor.skip.return_value.limit.return_value.to_list.return_value = mock_reports
        mock_server_db.incident_reports.find.return_value = mock_cursor

        # Get reports with status filter
        filtered_response = client.get("/api/incidents?status=submitted", headers=headers)
        assert filtered_response.status_code == 200

        filtered_reports = filtered_response.json()
        assert len(filtered_reports) == 2  # Mock returns all, but in real app would filter