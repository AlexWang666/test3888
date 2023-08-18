INSERT INTO organization (name, shortname, description, link, logo_url, address, email, phone) VALUES 
('The University of Sydney', 'USYD', 'Sydney Uni', 'https://www.sydney.edu.au/', '', 'Australia', 'hello@sydney.com', '+61 2 9351 2222'),
('Commonwealth Scientific and Industrial Research Organisation', 'CSIRO', 'Australian Government agency', 'https://www.csiro.au/en/', 
'', 'Australia', 'hello@csiro.com', '+61 3 9545 2176');

-- Decoded Password: searten@123
INSERT INTO admin (user_name, email, password) VALUES ('searten_admin', 'admin@searten.com', '$2b$10$I0KeZ7oZCt.G7Zsmc9WkVeV4293iQXqC.l4ESRwZg8VkHFfAq6y3q');
