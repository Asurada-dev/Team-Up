import psycopg2
import os
from dotenv import load_dotenv


load_dotenv()
db_password = os.getenv("RDS_POSTGRESQL_SECRET")
db_host = os.getenv("RDS_POSTGRESQL_HOST")
db_user = os.getenv("RDS_POSTGRESQL_USER")
db_database = os.getenv("RDS_POSTGRESQL_DATABASE")


class Postgres:
    username = db_user
    password = db_password
    hostname = db_host
    database = db_database

    def connect(self):
        return psycopg2.connect(
            host=self.hostname,
            user=self.username,
            password=self.password,
            dbname=self.database,
        )


class MovieIdPipeline:
    def __init__(self):
        self.connection = Postgres.connect(Postgres)

        self.cur = self.connection.cursor()

        self.cur.execute(
            """
        CREATE TABLE IF NOT EXISTS movie(
          id INT PRIMARY KEY,
          title TEXT,
          update_time TIMESTAMP
        );
        """
        )

        self.cur.execute("SELECT id FROM movie;")
        rows = self.cur.fetchall()

        self.ids_in_database = list(row[0] for row in rows)
        self.connection.commit()

    def process_item(self, item, spider):
        if item["id"] in self.ids_in_database:
            self.cur.execute(
                "UPDATE movie SET update_time=CURRENT_TIMESTAMP WHERE id=(%s);",
                (item["id"],),
            )
        else:
            self.cur.execute(
                "INSERT INTO movie (id, title, update_time) values (%s, %s, CURRENT_TIMESTAMP);",
                (
                    item["id"],
                    item["title"],
                ),
            )
        self.connection.commit()

        return item


class MovieCityPipeline:
    def __init__(self):
        self.connection = Postgres.connect(Postgres)

        self.cur = self.connection.cursor()

        self.cur.execute(
            """
        CREATE TABLE IF NOT EXISTS city (
            id INT PRIMARY KEY,
            name TEXT
        );
        """
        )

        self.cur.execute("TRUNCATE TABLE city CASCADE;")
        self.connection.commit()

    def process_item(self, item, spider):
        self.cur.execute(
            "INSERT INTO city (id, name) values (%s, %s);",
            (
                item["id"],
                item["name"],
            ),
        )
        self.connection.commit()
        return item


class MovieTheaterPipeline:
    def __init__(self):
        self.connection = Postgres.connect(Postgres)

        self.cur = self.connection.cursor()

        self.cur.execute(
            """
        CREATE TABLE IF NOT EXISTS theater (
            id INT PRIMARY KEY,
            name TEXT,
            address TEXT,
            tel TEXT,
            city_id INT REFERENCES city(id)
        );
        """
        )
        self.connection.commit()

    def process_item(self, item, spider):
        self.cur.execute(
            "INSERT INTO theater (id, name, address, tel, city_id) values (%s, %s, %s, %s, %s);",
            (
                item["id"],
                item["name"],
                item["address"],
                item["tel"],
                item["city_id"],
            ),
        )
        self.connection.commit()
        return item


class MovieSchedulePipeline:
    def __init__(self):
        self.connection = Postgres.connect(Postgres)

        self.cur = self.connection.cursor()

        self.cur.execute(
            """
        CREATE TABLE IF NOT EXISTS movie_schedule (
            id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            movie_id INT REFERENCES movie(id) ON DELETE CASCADE,
            theater_id INT REFERENCES theater(id),
            date DATE,
            time TIME,
            kind TEXT
        );
        """
        )

        self.cur.execute("SELECT movie_id, theater_id, date, time FROM movie_schedule;")
        rows = self.cur.fetchall()

        self.date_in_database = rows

        self.connection.commit()

    def process_item(self, item, spider):
        if (
            item["movie_id"],
            item["theater_id"],
            item["date"],
            item["time"],
        ) not in self.date_in_database:
            self.cur.execute(
                """INSERT INTO movie_schedule (movie_id, theater_id, date, time, kind)
                values (%s, %s, %s, %s, %s);""",
                (
                    item["movie_id"],
                    item["theater_id"],
                    str(item["date"]),
                    str(item["time"]),
                    str(item["kind"]),
                ),
            )
            self.connection.commit()
        return item


class MovieInfoPipeline:
    def __init__(self):
        self.connection = Postgres.connect(Postgres)

        self.cur = self.connection.cursor()

        self.cur.execute(
            """
        CREATE TABLE IF NOT EXISTS movie_info (
            id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            movie_id INT REFERENCES movie(id) ON DELETE CASCADE,
            title TEXT,
            title_en TEXT,
            release_date DATE,
            runtime TEXT,
            director TEXT,
            imdb REAL,
            img TEXT
        );
        """
        )

        self.cur.execute("SELECT movie_id FROM movie_info;")
        rows = self.cur.fetchall()

        self.ids_in_database = list(row[0] for row in rows)

        self.connection.commit()

    def process_item(self, item, spider):
        if item["movie_id"] not in self.ids_in_database:
            self.cur.execute(
                """INSERT INTO movie_info (movie_id, title, title_en, release_date, runtime,
                director, imdb, img) values (%s, %s, %s, %s, %s, %s, %s, %s );""",
                (
                    item["movie_id"],
                    item["title"],
                    item["title_en"],
                    item["release_date"],
                    item["runtime"],
                    item["director"],
                    item["imdb"],
                    item["img"],
                ),
            )
            self.connection.commit()
        return item
