def test_get_users_empty(client):
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_users_with_data(client, sample_user):
    response = client.get("/api/v1/users/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == "user@test.com"


def test_get_user_by_id(client, sample_user):
    response = client.get(f"/api/v1/users/{sample_user.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test User"
    assert data["role"] == "operations_manager"


def test_get_user_not_found(client):
    response = client.get("/api/v1/users/99999")
    assert response.status_code == 404


def test_create_user(client):
    user_data = {
        "email": "newuser@test.com",
        "name": "New User",
        "role": "dispatcher",
        "status": "active",
    }
    response = client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "dispatcher"


def test_update_user(client, sample_user):
    update_data = {
        "email": "updated@test.com",
        "name": "Updated User",
        "role": "admin",
        "status": "inactive",
    }
    response = client.put(f"/api/v1/users/{sample_user.id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated User"
    assert data["role"] == "admin"


def test_delete_user(client, sample_user):
    response = client.delete(f"/api/v1/users/{sample_user.id}")
    assert response.status_code == 200

    response = client.get(f"/api/v1/users/{sample_user.id}")
    assert response.status_code == 404
