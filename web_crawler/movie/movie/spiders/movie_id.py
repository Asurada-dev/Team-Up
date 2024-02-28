import scrapy

from ..items import MovieId


class MovieIdSpider(scrapy.Spider):
    name = "movie_id"
    allowed_domains = ["www.atmovies.com.tw"]
    custom_settings = {"ITEM_PIPELINES": {"movie.pipelines.MovieIdPipeline": 400}}

    def start_requests(self):
        url = "http://www.atmovies.com.tw/movie/now/"
        yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        item = MovieId()

        movie_list = response.css("ul.filmListPA > li")
        for li in movie_list:
            item["id"] = li.css("a::attr(href)").get().split("/")[-2]
            item["title"] = li.css("a::text").get().strip()

            yield (item)
