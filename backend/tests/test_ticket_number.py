"""
Unit tests for ticket number generation functionality.

These tests verify that:
1. Ticket numbers are generated in the correct format (YYXXXXXX)
2. Ticket numbers are unique even under concurrent submission scenarios
3. The system handles collisions gracefully without user-facing errors
"""

import unittest
import sys
import os
import threading
import random
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add parent directory to path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from utils.ticket_number import generate_ticket_number
from models.job_ticket import JobTicket

class TestTicketNumberGeneration(unittest.TestCase):
    """Test case for ticket number generation functionality."""
    
    def setUp(self):
        """Set up test environment."""
        self.db = SessionLocal()
        
    def tearDown(self):
        """Clean up after tests."""
        self.db.close()
    
    def test_ticket_number_format(self):
        """Test that generated ticket numbers follow the required format."""
        ticket_number = generate_ticket_number(self.db)
        
        # Check length
        self.assertEqual(len(ticket_number), 8, "Ticket number should be 8 characters long")
        
        # Check year part (first 2 digits)
        import datetime
        current_year = str(datetime.datetime.now().year)[-2:]
        self.assertEqual(ticket_number[:2], current_year, 
                         f"First 2 digits should be the current year ({current_year})")
        
        # Check that remaining 6 digits are numeric
        self.assertTrue(ticket_number[2:].isdigit(), 
                        "Last 6 characters should be digits")
        
        # Check that the numeric part is properly zero-padded
        self.assertEqual(len(ticket_number[2:]), 6, 
                         "Numeric part should be exactly 6 digits")
    
    def test_ticket_number_uniqueness(self):
        """Test that generated ticket numbers are unique."""
        # Generate multiple ticket numbers
        ticket_numbers = set()
        for _ in range(100):
            ticket_number = generate_ticket_number(self.db)
            # Ensure we haven't seen this number before
            self.assertNotIn(ticket_number, ticket_numbers, 
                            f"Duplicate ticket number generated: {ticket_number}")
            ticket_numbers.add(ticket_number)
    
    def test_concurrent_ticket_generation(self):
        """Test that ticket numbers are unique even when generated concurrently."""
        # Function to generate a ticket number in a separate thread
        def generate_ticket():
            db = SessionLocal()
            try:
                return generate_ticket_number(db)
            finally:
                db.close()
        
        # Generate ticket numbers concurrently
        ticket_numbers = set()
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(generate_ticket) for _ in range(50)]
            
            for future in as_completed(futures):
                ticket_number = future.result()
                # Ensure we haven't seen this number before
                self.assertNotIn(ticket_number, ticket_numbers, 
                                f"Duplicate ticket number generated in concurrent test: {ticket_number}")
                ticket_numbers.add(ticket_number)
    
    def test_collision_handling(self):
        """Test that the system handles collisions gracefully."""
        # Create a mock database session that simulates collisions
        class MockSession:
            def __init__(self, collision_count=3):
                self.collision_count = collision_count
                self.query_count = 0
                self.ticket_numbers = set()
            
            def query(self, model):
                return self
            
            def filter(self, condition):
                return self
            
            def first(self):
                self.query_count += 1
                # Simulate a collision for the first few queries
                if self.query_count <= self.collision_count:
                    # Return a mock ticket to simulate collision
                    mock_ticket = type('MockTicket', (), {})
                    return mock_ticket
                # After that, return None to indicate no collision
                return None
        
        # Test with a mock session that simulates 3 collisions
        mock_session = MockSession(collision_count=3)
        ticket_number = generate_ticket_number(mock_session)
        
        # Verify that we made at least 4 queries (3 collisions + 1 success)
        self.assertGreaterEqual(mock_session.query_count, 4, 
                               "Should have tried multiple times on collision")
        
        # Verify the ticket number format
        import datetime
        current_year = str(datetime.datetime.now().year)[-2:]
        self.assertEqual(ticket_number[:2], current_year)
        self.assertEqual(len(ticket_number), 8)

if __name__ == "__main__":
    unittest.main()
