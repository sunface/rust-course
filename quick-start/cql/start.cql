CREATE KEYSPACE im_dev WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '3'}  
    AND durable_writes = false;

USE im_dev;

CREATE TABLE IF NOT EXISTS user (
    --account
    id               text,
    name             text,
    email            text,

    --userprofile
    nickname         text, 
    avatar           text, 
    website          text,
    about            text,
    location         text,
    bg_color         text,
    text_color       text,
    looking_for_work boolean, 
    education        text,
    employer         text,
    skills           text,
    available_for    text,
    working_exp      text,

    create_date     bigint,
    edit_date        bigint,
    PRIMARY KEY (id)
) WITH gc_grace_seconds = 10800;
CREATE CUSTOM INDEX IF NOT EXISTS ON user (name) 
    USING 'org.apache.cassandra.index.sasi.SASIIndex' ;
    

CREATE TABLE IF NOT EXISTS article (
    id               text, 
    uid              text,          --  author user id  
    title            text,          -- article title          
    tags             list<text>,
    md               text,          -- markdown
    render           text,          --  rendered html
    status           tinyint,       -- 1. draft 2. published 3. delete
    publish_date     bigint,
    edit_date        bigint,  
    
    lang             text,          -- in which language the article was written   
    PRIMARY KEY (id)
) WITH gc_grace_seconds = 10800;
CREATE CUSTOM INDEX IF NOT EXISTS ON article (uid) 
    USING 'org.apache.cassandra.index.sasi.SASIIndex' ;

CREATE CUSTOM INDEX IF NOT EXISTS ON article (lang) 
    USING 'org.apache.cassandra.index.sasi.SASIIndex' ;

CREATE TABLE IF NOT EXISTS tags (
    name               text,
    article_id         text,
    PRIMARY KEY (name,article_id)
) WITH gc_grace_seconds = 10800;


CREATE TABLE IF NOT EXISTS comment (
    id               text, 
    pid              text,          -- parent comment id
    uid              text,          -- author user id  

    post_id          text,          -- related post id 
    post_type        tinyint,       -- related post type

    md               text,          -- markdown
    render           text,          --  rendered html

    publish_date     bigint,
    edit_date        bigint,

    status           tinyint,       -- 0: normal, 1: deleted
    PRIMARY KEY (id)
) WITH gc_grace_seconds = 10800;
CREATE CUSTOM INDEX IF NOT EXISTS ON comment (post_id) 
    USING 'org.apache.cassandra.index.sasi.SASIIndex' ;



CREATE TABLE IF NOT EXISTS post_counter (
    id         text,          -- post id
    
    comments   counter,
    likes      counter, 
    recommands counter,

    PRIMARY KEY (id)
) WITH gc_grace_seconds = 10800;

CREATE TABLE IF NOT EXISTS comment_counter (
    id         text,          -- comment id
    likes   counter,
    PRIMARY KEY (id)
) WITH gc_grace_seconds = 10800;

-- record whether a user likes a comment
CREATE TABLE IF NOT EXISTS comment_like (
    comment_id    text,      -- comment id
    uid        text,         -- user id
    type       tinyint,      -- 1: like 2: dislike
    input_date bigint,
    PRIMARY KEY (comment_id,uid)
) WITH gc_grace_seconds = 10800;
CREATE CUSTOM INDEX IF NOT EXISTS ON comment_like (uid) 
    USING 'org.apache.cassandra.index.sasi.SASIIndex' ;
