#!/usr/bin/env python3
"""
Authentication API Test Script for JobTicketInvoice Backend

This script provides command-line utilities to test the authentication API endpoints.
It allows testing registration, login, profile retrieval, and logo upload functionality.
"""

import argparse
import json
import os
import sys
import requests
from datetime import datetime
from typing import Dict, Any, Optional

# Default API base URL
DEFAULT_API_URL = "http://localhost:8000"

# Terminal colors for better readability
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(text: str) -> None:
    """Print a formatted header."""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(50)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 50}{Colors.ENDC}\n")

def print_json(data: Dict[str, Any]) -> None:
    """Print JSON data in a formatted way."""
    print(json.dumps(data, indent=2))

def save_token(token: str, token_file: str = ".auth_token") -> None:
    """Save authentication token to a file."""
    with open(token_file, "w") as f:
        f.write(token)
    print(f"{Colors.GREEN}Token saved to {token_file}{Colors.ENDC}")

def load_token(token_file: str = ".auth_token") -> Optional[str]:
    """Load authentication token from a file."""
    if not os.path.exists(token_file):
        return None
    with open(token_file, "r") as f:
        return f.read().strip()

def test_register(args: argparse.Namespace) -> None:
    """Test user registration endpoint."""
    print_header("Testing User Registration")
    
    # Prepare registration data
    registration_data = {
        "name": args.name,
        "email": args.email,
        "password": args.password,
        "role": args.role
    }
    
    # Add role-specific fields
    if args.role == "tech":
        registration_data["job_type"] = args.job_type
    elif args.role == "manager":
        registration_data["company_name"] = args.company_name
    
    print(f"{Colors.CYAN}Sending registration request with data:{Colors.ENDC}")
    # Don't print the password in the console output
    safe_data = {**registration_data, "password": "********"}
    print_json(safe_data)
    
    # Make the API request
    try:
        response = requests.post(
            f"{args.api_url}/api/auth/register",
            json=registration_data
        )
        
        # Process the response
        if response.status_code == 200:
            data = response.json()
            print(f"{Colors.GREEN}Registration successful!{Colors.ENDC}")
            print_json(data)
            
            # Save the token if requested
            if args.save_token:
                save_token(data["access_token"])
                
            return data
        else:
            print(f"{Colors.FAIL}Registration failed with status code: {response.status_code}{Colors.ENDC}")
            try:
                print_json(response.json())
            except:
                print(response.text)
    except Exception as e:
        print(f"{Colors.FAIL}Error during registration: {str(e)}{Colors.ENDC}")
    
    return None

def test_login(args: argparse.Namespace) -> None:
    """Test user login endpoint."""
    print_header("Testing User Login")
    
    print(f"{Colors.CYAN}Attempting login with email: {args.email}{Colors.ENDC}")
    
    # Prepare login data
    login_data = {
        "username": args.email,
        "password": args.password
    }
    
    # Make the API request
    try:
        response = requests.post(
            f"{args.api_url}/api/auth/login",
            data=login_data  # Note: Using form data, not JSON
        )
        
        # Process the response
        if response.status_code == 200:
            data = response.json()
            print(f"{Colors.GREEN}Login successful!{Colors.ENDC}")
            print_json(data)
            
            # Save the token if requested
            if args.save_token:
                save_token(data["access_token"])
                
            return data
        else:
            print(f"{Colors.FAIL}Login failed with status code: {response.status_code}{Colors.ENDC}")
            try:
                print_json(response.json())
            except:
                print(response.text)
    except Exception as e:
        print(f"{Colors.FAIL}Error during login: {str(e)}{Colors.ENDC}")
    
    return None

def test_profile(args: argparse.Namespace) -> None:
    """Test profile retrieval endpoint."""
    print_header("Testing Profile Retrieval")
    
    # Load token
    token = args.token or load_token()
    if not token:
        print(f"{Colors.FAIL}No token provided or found. Please login first or provide a token.{Colors.ENDC}")
        return None
    
    print(f"{Colors.CYAN}Retrieving user profile with token{Colors.ENDC}")
    
    # Make the API request
    try:
        response = requests.get(
            f"{args.api_url}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Process the response
        if response.status_code == 200:
            data = response.json()
            print(f"{Colors.GREEN}Profile retrieved successfully!{Colors.ENDC}")
            print_json(data)
            return data
        else:
            print(f"{Colors.FAIL}Profile retrieval failed with status code: {response.status_code}{Colors.ENDC}")
            try:
                print_json(response.json())
            except:
                print(response.text)
    except Exception as e:
        print(f"{Colors.FAIL}Error retrieving profile: {str(e)}{Colors.ENDC}")
    
    return None

def test_logo_upload(args: argparse.Namespace) -> None:
    """Test logo upload endpoint."""
    print_header("Testing Logo Upload")
    
    # Check if logo file exists
    if not os.path.exists(args.logo_file):
        print(f"{Colors.FAIL}Logo file not found: {args.logo_file}{Colors.ENDC}")
        return None
    
    # Load token
    token = args.token or load_token()
    if not token:
        print(f"{Colors.FAIL}No token provided or found. Please login first or provide a token.{Colors.ENDC}")
        return None
    
    print(f"{Colors.CYAN}Uploading logo file: {args.logo_file}{Colors.ENDC}")
    
    # Make the API request
    try:
        with open(args.logo_file, "rb") as logo:
            files = {"logo": (os.path.basename(args.logo_file), logo)}
            response = requests.post(
                f"{args.api_url}/api/auth/logo",
                headers={"Authorization": f"Bearer {token}"},
                files=files
            )
        
        # Process the response
        if response.status_code == 200:
            data = response.json()
            print(f"{Colors.GREEN}Logo uploaded successfully!{Colors.ENDC}")
            print_json(data)
            return data
        else:
            print(f"{Colors.FAIL}Logo upload failed with status code: {response.status_code}{Colors.ENDC}")
            try:
                print_json(response.json())
            except:
                print(response.text)
    except Exception as e:
        print(f"{Colors.FAIL}Error uploading logo: {str(e)}{Colors.ENDC}")
    
    return None

def main() -> None:
    """Main function to parse arguments and execute tests."""
    parser = argparse.ArgumentParser(description="Test JobTicketInvoice Authentication API")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Common arguments
    parser.add_argument("--api-url", default=DEFAULT_API_URL, help="API base URL")
    parser.add_argument("--token", help="JWT token for authenticated requests")
    parser.add_argument("--save-token", action="store_true", help="Save token to file")
    
    # Register command
    register_parser = subparsers.add_parser("register", help="Test user registration")
    register_parser.add_argument("--name", required=True, help="User's full name")
    register_parser.add_argument("--email", required=True, help="User's email address")
    register_parser.add_argument("--password", required=True, help="User's password")
    register_parser.add_argument("--role", choices=["tech", "manager"], required=True, help="User's role")
    register_parser.add_argument("--job-type", help="Job type (required for tech role)")
    register_parser.add_argument("--company-name", help="Company name (required for manager role)")
    
    # Login command
    login_parser = subparsers.add_parser("login", help="Test user login")
    login_parser.add_argument("--email", required=True, help="User's email address")
    login_parser.add_argument("--password", required=True, help="User's password")
    
    # Profile command
    subparsers.add_parser("profile", help="Test profile retrieval")
    
    # Logo upload command
    logo_parser = subparsers.add_parser("logo", help="Test logo upload")
    logo_parser.add_argument("--logo-file", required=True, help="Path to logo file")
    
    args = parser.parse_args()
    
    # Execute the requested command
    if args.command == "register":
        if args.role == "tech" and not args.job_type:
            print(f"{Colors.FAIL}Error: --job-type is required for tech role{Colors.ENDC}")
            sys.exit(1)
        if args.role == "manager" and not args.company_name:
            print(f"{Colors.FAIL}Error: --company-name is required for manager role{Colors.ENDC}")
            sys.exit(1)
        test_register(args)
    elif args.command == "login":
        test_login(args)
    elif args.command == "profile":
        test_profile(args)
    elif args.command == "logo":
        test_logo_upload(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
