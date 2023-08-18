SELECT user_id, email, date_created, keywords_query
FROM expert_search as es
INNER JOIN profile as p
ON es.user_id = p.id;

-- Number of expert search queries made by each user:
SELECT user_id, first_name, last_name, email, COUNT(user_id) as count
FROM expert_search as es
INNER JOIN profile as p
ON es.user_id = p.id
GROUP BY user_id, first_name, last_name, email
ORDER BY count DESC;

--  karl.malitz@riotinto.com
SELECT first_name, last_name, email, date_created, keywords_query
FROM expert_search as es
INNER JOIN profile as p
ON es.user_id = p.id
WHERE es.user_id = 14;

-- helen.smith@riotinto.com
SELECT first_name, last_name, email, date_created, keywords_query
FROM expert_search as es
INNER JOIN profile as p
ON es.user_id = p.id
WHERE es.user_id = 18;

-- andrew.hill@sydney.edu.au
SELECT first_name, last_name, email, date_created, keywords_query
FROM expert_search as es
INNER JOIN profile as p
ON es.user_id = p.id
WHERE es.user_id = 11;