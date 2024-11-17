DELETE FROM studentdb.users WHERE username <> 'admin';
SET SQL_SAFE_UPDATES = 0;
DELETE FROM studentdb.posts;
SELECT * FROM studentdb.posts;
SET SQL_SAFE_UPDATES = 1;