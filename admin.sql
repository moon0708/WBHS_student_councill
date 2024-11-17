UPDATE studentdb.users
SET manage = 1
WHERE username = 'admin';
SELECT * FROM studentdb.users;