drop table if exists expert_search;

create table expert_search(
  id serial,
  user_id int REFERENCES profile (id),
  date_created timestamptz,
  raw_query varchar, 
  keywords_query varchar, 
  results varchar,
  primary key (id, user_id)
);