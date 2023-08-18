-- Database setup with initial schema

drop table if exists profile cascade;
drop table if exists profile_info cascade;
drop table if exists project cascade;
drop table if exists milestone;
drop table if exists task cascade;
drop table if exists subtask;
drop table if exists people_to_project;
drop table if exists notes;
drop table if exists chat cascade;
drop table if exists people_to_chat;
drop table if exists messages;
drop table if exists budget_category cascade;
drop table if exists budget_item;
drop table if exists drive_item cascade;
drop table if exists people_to_drive_item;

create table profile(
  id serial,
  first_name varchar,
  last_name varchar,
  email varchar unique, -- id and email are unique
  password varchar,
  primary key (id)
);

create table profile_info (
  user_id int REFERENCES profile(id),
  bio varchar,
  education varchar,
  link varchar,
  primary key(user_id)
);

create table project(
  id serial,
  title varchar,
  proj_desc varchar,
  proj_long_desc varchar,
  parent int,
  s_date date,
  e_date date,
  private boolean,
  completed boolean,
  completed_date date,
  primary key (id)
);

create table people_to_project(
  user_id int REFERENCES profile (id),
  project_id int REFERENCES project (id),
  user_role char,
  primary key (user_id, project_id)
);

create table task(
  id serial,
  proj int REFERENCES project (id),
  title varchar,
  task_desc varchar,
  s_date date,
  e_date date,
  responsible int REFERENCES profile (id),
  completed boolean,
  completed_date date,
  primary key (id)
);

create table milestone(
  id serial,
  proj int REFERENCES project (id),
  title varchar,
  mile_desc varchar,
  s_date date,
  responsible int REFERENCES profile (id),
  completed boolean,
  completed_date date,
  primary key (id)
);

create table subtask(
  id serial,
  parent_task int REFERENCES task (id),
  title varchar,
  completed boolean,
  primary key (id)
);

create table notes(
  id serial,
  user_id int REFERENCES profile (id),
  title varchar,
  note_content varchar,
  primary key (id, user_id)
);

create table chat(
  id serial,
  date_created timestamptz,
  title varchar,
  creator int REFERENCES profile (id),
  primary key (id)
);

create table people_to_chat(
  user_id int REFERENCES profile (id),
  chat_id int REFERENCES chat (id),
  primary key (user_id, chat_id)
);

create table messages(
  id serial,
  user_id int REFERENCES profile (id),
  chat_id int REFERENCES chat (id),
  date_sent timestamptz,
  message varchar,
  primary key (id, chat_id)
);

create table budget_category(
  id serial,
  category varchar,
  proj_id int REFERENCES project (id),
  primary key (id, proj_id)
);

create table budget_item(
  id serial,
  item varchar,
  quantity int,
  cost_per real,
  spent real,
  cat_id int,
  proj_id int REFERENCES project (id),
  task_id int REFERENCES task (id),
  FOREIGN KEY (cat_id, proj_id) REFERENCES budget_category (id, proj_id),
  primary key (id, proj_id)
);

create table drive_item (
  uuid varchar(36) primary key,
  item_type varchar, -- document or folder
  name varchar,
  owner_id int references profile (id),
  contents varchar,
  is_file_url boolean default FALSE,
  parent_uuid varchar(36) references drive_item (uuid) on delete cascade
);

create table people_to_drive_item (
  user_id int references profile (id),
  drive_item_id varchar(36) references drive_item (uuid),
  user_role varchar, -- right now, just Viewer and Editor
  primary key(user_id, drive_item_id)
);
