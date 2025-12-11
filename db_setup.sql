-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  createdat TIMESTAMPTZ DEFAULT NOW()
);

-- Create thoughts table
CREATE TABLE thoughts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  createdat TIMESTAMPTZ DEFAULT NOW()
);

-- Create nodes table
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thought_id UUID NOT NULL REFERENCES thoughts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0
);

-- Insert sample data
INSERT INTO users (id, name, email, createdat) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Harsh K', 'harsh@example.com', '2025-12-11T09:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440001', 'Aarav Sharma', 'aarav@example.com', '2025-11-22T14:20:00.000Z'),
('550e8400-e29b-41d4-a716-446655440002', 'Meera Jain', 'meera@example.com', '2025-10-15T18:45:00.000Z');

INSERT INTO thoughts (id, user_id, title, description, createdat) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'I hesitate to speak in meetings', 'I stay quiet even when I have ideas worth sharing', '2025-12-10T10:00:00.000Z'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'I keep overthinking career decisions', 'I bounce between options and lose momentum', '2025-12-11T08:30:00.000Z'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'I get attached to people too quickly', 'Emotional dependence forms very fast for me', '2025-12-01T12:45:00.000Z'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'I procrastinate on studying', 'I delay even when deadlines are close', '2025-11-30T16:20:00.000Z'),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'I strive for perfection in my work', 'I feel nothing I produce is ever good enough', '2025-10-20T09:15:00.000Z'),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'I feel anxious around new people', 'I avoid conversations in unfamiliar settings', '2025-10-25T11:05:00.000Z');

INSERT INTO nodes (id, thought_id, parent_id, content, "order", level) VALUES
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440010', NULL, 'I worry my ideas might sound stupid', 0, 0),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440100', 'I compare myself to more senior people', 0, 1),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440100', 'I fear being judged if I''m wrong', 1, 1),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440101', 'I assume others know more than me', 0, 2),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440010', NULL, 'I stay silent even when I have solutions', 1, 0),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440011', NULL, 'I keep switching between career options', 0, 0),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440105', 'I fear choosing the wrong path', 0, 1),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440105', 'I try to optimise every decision perfectly', 1, 1),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440106', 'Past decisions didn''t go as planned', 0, 2),
('550e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440012', NULL, 'I trust people very quickly', 0, 0),
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440109', 'I crave emotional closeness early', 0, 1),
('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440109', 'I fear being alone', 1, 1);