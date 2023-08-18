-- Add organization schema & Update profile info schema
-- Update project schema with last_modified field
-- Update project, task, milestone schema with createdAt field
-- Update people_to_project schema with status field

create table organization (
  id serial,
  name varchar unique,
  shortname varchar,
  description varchar,
  link varchar,
  logo_url varchar,
  address varchar,
  email varchar,
  phone varchar,
  primary key (id)
);

alter table profile_info add org_id int REFERENCES organization(id);

alter table project add last_modified date DEFAULT CURRENT_TIMESTAMP;

alter table task add createdAt timestamptz DEFAULT CURRENT_TIMESTAMP;

alter table milestone add createdAt timestamptz DEFAULT CURRENT_TIMESTAMP;

alter table people_to_project add status varchar DEFAULT 'accepted';