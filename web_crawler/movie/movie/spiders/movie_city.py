import scrapy

from ..items import MovieCity


class MovieCitySpider(scrapy.Spider):
    name = "movie_city"

    allowed_domains = ["www.atmovies.com.tw"]
    custom_settings = {"ITEM_PIPELINES": {"movie.pipelines.MovieCityPipeline": 400}}

    def start_requests(self):
        url = "http://www.atmovies.com.tw/showtime/"
        yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        item = MovieCity()

        city_list = response.css("ul.theaterArea > li")
        if len(city_list) > 0:
            for i, li in enumerate(city_list):
                if i == 0:
                    continue
                item["id"] = li.css("a::attr(href)").get().split("a")[1].rstrip("/")
                item["name"] = li.css("a::text").get().strip()

                yield (item)
