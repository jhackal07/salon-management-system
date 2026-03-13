-- Optional: seed services to match the frontend booking dropdown (run once after schema)
INSERT INTO services (name, description, price, duration) VALUES
  ('Nail Treatment', 'Manicure and nail care', 35.00, 60),
  ('Hair Treatment', 'Hair cut and styling', 45.00, 90),
  ('Facial', 'Cleansing and facial massage', 55.00, 75);
