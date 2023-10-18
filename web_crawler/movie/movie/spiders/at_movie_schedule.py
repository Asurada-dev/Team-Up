import scrapy
import re
from ..items import MovieSchedule
from ..pipelines import Postgres
from datetime import datetime


class MovieScheduleSpider(scrapy.Spider):
    name = "at_movie_schedule"
    allowed_domains = ["www.atmovies.com.tw"]
    custom_settings = {"ITEM_PIPELINES": {"movie.pipelines.MovieSchedulePipeline": 400}}

    movie_id = []
    city_id = []

    def start_requests(self):
        self.connection = Postgres.connect(Postgres)
        self.cur = self.connection.cursor()

        self.cur.execute("SELECT id FROM movie;")
        movie_ids = self.cur.fetchall()
        for id in movie_ids:
            self.movie_id.append(id[0])

        self.cur.execute("SELECT id FROM city;")
        city_ids = self.cur.fetchall()
        for id in city_ids:
            self.city_id.append(id[0])

        for movie in self.movie_id:
            for city in self.city_id:
                formatted_city_id = f"{city:02}"
                url = (
                    f"http://www.atmovies.com.tw/showtime/{movie}/a{formatted_city_id}/"
                )
                yield scrapy.Request(url=url, callback=self.parse, meta={"id": movie})

    def parse(self, response):
        item = MovieSchedule()

        show_time = response.css('[id="filmShowtimeBlock"]')
        theater_list = show_time.css("ul")

        for theater in theater_list:
            theater_link = theater.css("li.theaterTitle > a::attr(href)").get()
            theater_id = re.search(r"/t(\w+)/", theater_link).group(1)

            schedule_list = theater.css("li")

            for schedule in schedule_list:
                time = schedule.css("::text").get()
                if re.match(r"^\d{2}：\d{2}$", time):
                    formatted_time = datetime.strptime(time, "%H：%M").time()
                    item["movie_id"] = response.meta["id"]
                    item["date"] = datetime.now().date()
                    item["time"] = formatted_time
                    item["theater_id"] = theater_id
                    item["kind"] = "Default"
                    yield (item)
