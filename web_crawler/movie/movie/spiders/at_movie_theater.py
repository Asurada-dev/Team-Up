import scrapy
import re
from ..items import MovieTheater
from ..pipelines import Postgres


class MovieTheaterSpider(scrapy.Spider):
    name = "at_movie_theater"
    allowed_domains = ["www.atmovies.com.tw"]
    city_id = []
    custom_settings = {"ITEM_PIPELINES": {"movie.pipelines.MovieTheaterPipeline": 400}}

    def start_requests(self):
        self.connection = Postgres.connect(Postgres)
        self.cur = self.connection.cursor()
        self.cur.execute("SELECT id FROM city;")

        ids = self.cur.fetchall()
        for i in ids:
            self.city_id.append(i[0])

        for id in self.city_id:
            formatted_id = f"{id:02}"
            url = f"http://www.atmovies.com.tw/showtime/a{formatted_id}/"
            yield scrapy.Request(
                url=url, callback=self.parse, meta={"id": formatted_id}
            )

    def parse(self, response):
        item = MovieTheater()

        theater_list = response.css('[id="theaterList"] > li')
        if len(theater_list) > 0:
            for li in theater_list:
                if li.css("::attr(class)").get() == "type0":
                    continue

                item["name"] = li.css("a::text").get().strip()
                item["id"] = re.search(
                    r"/t(\w+)/", li.css("a::attr(href)").get()
                ).group(1)
                theater_info = li.css("ul > li::text").getall()
                item["address"] = theater_info[0].strip()
                item["tel"] = theater_info[1].strip()
                item["city_id"] = response.meta["id"]
                yield (item)
