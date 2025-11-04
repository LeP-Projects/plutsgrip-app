"""
Unit tests for security utilities
"""
import pytest
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_token,
    get_user_id_from_token
)


def test_password_hashing():
    """Test password hashing and verification"""
    password = "mysecretpassword"
    hashed = get_password_hash(password)

    # Hash should be different from original
    assert hashed != password

    # Verification should work
    assert verify_password(password, hashed) is True

    # Wrong password should fail
    assert verify_password("wrongpassword", hashed) is False


def test_create_and_decode_token():
    """Test JWT token creation and decoding"""
    user_id = "123"
    token = create_access_token(data={"sub": user_id})

    # Token should be a string
    assert isinstance(token, str)
    assert len(token) > 0

    # Decoding should return the payload
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == user_id
    assert "exp" in payload


def test_get_user_id_from_token():
    """Test extracting user ID from token"""
    user_id = "456"
    token = create_access_token(data={"sub": user_id})

    # Should extract user ID correctly
    extracted_id = get_user_id_from_token(token)
    assert extracted_id == user_id


def test_invalid_token():
    """Test handling of invalid tokens"""
    invalid_token = "invalid.token.here"

    # Should return None for invalid token
    payload = decode_token(invalid_token)
    assert payload is None

    user_id = get_user_id_from_token(invalid_token)
    assert user_id is None
