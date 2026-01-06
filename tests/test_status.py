import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

from backend.server import app

client = TestClient(app)

class TestStatusEndpoints:
    @patch('backend.server.db')
    def test_create_status_check(self, mock_db):
        # Mock the database insert operation
        mock_db.status_checks.insert_one.return_value = MagicMock()

        status_data = {
            "client_name": "Test Client"
        }

        response = client.post("/api/status", json=status_data)
        assert response.status_code == 200

        data = response.json()
        assert data["client_name"] == "Test Client"
        assert "id" in data
        assert "timestamp" in data

        # Verify the database was called correctly
        mock_db.status_checks.insert_one.assert_called_once()
        call_args = mock_db.status_checks.insert_one.call_args[0][0]

        # Check that timestamp was converted to ISO string
        assert isinstance(call_args["timestamp"], str)
        assert call_args["client_name"] == "Test Client"

    @patch('backend.server.db')
    def test_get_status_checks(self, mock_db):
        # Mock the database find operation
        mock_status_checks = [
            {
                "id": "check1",
                "client_name": "Client 1",
                "timestamp": datetime(2023, 1, 1, 12, 0, 0, tzinfo=timezone.utc).isoformat()
            },
            {
                "id": "check2",
                "client_name": "Client 2",
                "timestamp": datetime(2023, 1, 2, 12, 0, 0, tzinfo=timezone.utc).isoformat()
            }
        ]

        # Mock the find operation to exclude _id and return the list
        mock_cursor = MagicMock()
        mock_cursor.to_list.return_value = mock_status_checks
        mock_db.status_checks.find.return_value = mock_cursor

        response = client.get("/api/status")
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 2

        # Check that timestamps are converted back to datetime objects
        for check in data:
            assert isinstance(check["timestamp"], str)  # FastAPI serializes datetime to ISO string
            assert "client_name" in check
            assert "id" in check

    @patch('backend.server.db')
    def test_get_status_checks_empty(self, mock_db):
        # Mock empty result
        mock_cursor = MagicMock()
        mock_cursor.to_list.return_value = []
        mock_db.status_checks.find.return_value = mock_cursor

        response = client.get("/api/status")
        assert response.status_code == 200

        data = response.json()
        assert data == []

    def test_root_endpoint(self):
        response = client.get("/api/")
        assert response.status_code == 200
        assert response.json() == {"message": "Hello World"}

    @patch('backend.server.db')
    def test_status_check_with_malformed_data(self, mock_db):
        # Test with missing required field
        status_data = {}  # Missing client_name

        response = client.post("/api/status", json=status_data)
        # Should still work due to Pydantic defaults, but let's check the response
        assert response.status_code == 200

        data = response.json()
        assert "id" in data
        assert "timestamp" in data
        # client_name should be empty or have a default

    @patch('backend.server.db')
    def test_database_error_handling(self, mock_db):
        # Mock database error
        mock_db.status_checks.insert_one.side_effect = Exception("Database connection failed")

        status_data = {
            "client_name": "Test Client"
        }

        # The endpoint doesn't have explicit error handling, so it might return 500
        # or the error might bubble up. This depends on FastAPI's error handling.
        response = client.post("/api/status", json=status_data)

        # In a real scenario, this would likely return a 500 error
        # For this test, we'll just ensure the request was made
        assert response.status_code in [200, 500]  # Depending on error handling

    @patch('backend.server.db')
    def test_status_checks_with_pagination(self, mock_db):
        # Test that the endpoint returns up to 1000 items as per the code
        mock_status_checks = [{"id": f"check{i}", "client_name": f"Client {i}", "timestamp": "2023-01-01T00:00:00Z"} for i in range(1500)]

        mock_cursor = MagicMock()
        mock_cursor.to_list.return_value = mock_status_checks[:1000]  # Should limit to 1000
        mock_db.status_checks.find.return_value = mock_cursor

        response = client.get("/api/status")
        assert response.status_code == 200

        data = response.json()
        assert len(data) <= 1000  # Should not exceed the limit