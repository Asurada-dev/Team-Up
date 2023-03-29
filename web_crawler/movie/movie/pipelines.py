# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import psycopg2

class Postgres:
    username = 'postgres'
    password = 'Bullet000731'
    hostname = 'localhost'
    database = 'teamup'
    def connect(self):
        return psycopg2.connect(host=self.hostname,user=self.username,password=self.password,dbname=self.database)


class MovieIdPipeline:

    def __init__(self):
        self.connection = Postgres.connect(Postgres)
        # se1lf.connection = psycopg2.connect(host=Postgres.hostname, user=Postgres.username, password=Postgres.password, dbname=Postgres.database)
        
        ## Create cursor, used to execute commands
        self.cur = self.connection.cursor()
    
        self.cur.execute("""
        CREATE TABLE IF NOT EXISTS movie(
          id INT PRIMARY KEY ,
          title TEXT
        );
        """)
        self.cur.execute("TRUNCATE TABLE movie CASCADE;")
        self.connection.commit()

    def process_item(self, item, spider):
        self.cur.execute(""" INSERT INTO movie (id, title) values (%s,%s)""", (
            item["id"],
            item["title"]
        ))
        self.connection.commit()
        return item

class MovieCityPipeline:

    def __init__(self):
        self.connection = Postgres.connect(Postgres)
        
        ## Create cursor, used to execute commands
        self.cur = self.connection.cursor()
    
        self.cur.execute("""
        CREATE TABLE IF NOT EXISTS city (
            id INT PRIMARY KEY,
            name TEXT
        );
        """)
        self.cur.execute("TRUNCATE TABLE city;")
        self.connection.commit()

    def process_item(self, item, spider):
        self.cur.execute(""" INSERT INTO city (id, name) values (%s, %s)""", (
            item["id"],
            item["name"]
        ))
        self.connection.commit()
        return item

class MovieTheaterPipeline:

    def __init__(self):
        self.connection = Postgres.connect(Postgres)
        
        ## Create cursor, used to execute commands
        self.cur = self.connection.cursor()
    
        self.cur.execute("""
        CREATE TABLE IF NOT EXISTS theater (
            id INT PRIMARY KEY,
            name TEXT,
            address TEXT,
            tel TEXT,
            city_id INT REFERENCES city(id)
        );
        """)
        self.cur.execute("TRUNCATE TABLE theater;")
        self.connection.commit()

    def process_item(self, item, spider):
        self.cur.execute(""" INSERT INTO theater (id, name, address, tel, city_id) values (%s, %s, %s, %s, %s)""", (
            item["id"],
            item["name"],
            item["address"],
            item["tel"],
            item["city_id"],
        ))
        self.connection.commit()
        return item

class MovieSchedulePipeline:

    def __init__(self):
        self.connection=Postgres.connect(Postgres)
        
        ## Create cursor, used to execute commands
        self.cur = self.connection.cursor()
    
        self.cur.execute("""
        CREATE TABLE IF NOT EXISTS movie_schedule (
            id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            movie_id INT REFERENCES movie(id),
            theater_id INT REFERENCES theater(id),
            date DATE,
            time TIME,
            kind TEXT
        );
        """)
        self.cur.execute("TRUNCATE TABLE movie_schedule;")
        self.connection.commit()

    def process_item(self, item, spider):
        print('---')
        print(item["movie_id"],
            item["theater_id"],
            item["date"],
            item["time"], 
            item["kind"])
        self.cur.execute(""" INSERT INTO movie_schedule (movie_id, theater_id, date, time, kind) values (%s, %s, %s, %s, %s)""", (
            item["movie_id"],
            item["theater_id"],
            str(item["date"]),
            str(item["time"]), 
            str(item["kind"])
        ))
        self.connection.commit()
        return item

class MovieInfoPipeline:

    def __init__(self):
        self.connection=Postgres.connect(Postgres)
        
        ## Create cursor, used to execute commands
        self.cur = self.connection.cursor()
    
        self.cur.execute("""
        CREATE TABLE IF NOT EXISTS movie_info (
            id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            movie_id INT REFERENCES movie(id),
            title TEXT,
            title_en TEXT,
            release_date DATE,
            runtime TEXT,
            distributor TEXT,
            imdb REAL,
            img TEXT
        );
        """)
        self.cur.execute("TRUNCATE TABLE movie_info;")
        self.connection.commit()

    def process_item(self, item, spider):
        self.cur.execute(""" INSERT INTO movie_info (movie_id, title, title_en, release_date, runtime, distributor, imdb, img) values (%s, %s, %s, %s, %s, %s, %s, %s )""", (
        item["movie_id"],
        item["title"],
        item["title_en"],
        item["release_date"],
        item["runtime"],
        item["distributor"],
        item["imdb_score"],
        item["img"],
        ))
        self.connection.commit()
        return item




