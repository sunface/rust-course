CREATE KEYSPACE im_dev WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3'}  
    AND durable_writes = false;

USE im_dev;

CREATE TABLE IF NOT EXISTS user (
    id               text,
    name             text,
    PRIMARY KEY (id)
) WITH gc_grace_seconds = 10800;

CREATE TABLE IF NOT EXISTS user_activity (
    id               text,
    PRIMARY KEY (id)
) WITH gc_grace_seconds = 10800;