-- Add admin schema 
-- Add feedback schema
-- Update profile & organization schema with status field

create table admin(
  id serial,
  user_name varchar,
  email varchar unique, -- id and email are unique
  password varchar,
  primary key (id)
);

alter table profile add status varchar DEFAULT 'active';

alter table organization add status varchar DEFAULT 'active';

create table feedback(
  id serial,
  name varchar,
  email varchar,
  title varchar,
  description varchar,
  status varchar DEFAULT 'active'
);