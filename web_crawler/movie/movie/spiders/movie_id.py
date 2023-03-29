import scrapy
import json

from ..items import MovieId


class MovieIdSpider(scrapy.Spider):
    name = "movie_id"
    allowed_domains = ["movies.yahoo.com.tw"]
    custom_settings = {
        'ITEM_PIPELINES': {
            'movie.pipelines.MovieIdPipeline': 400
        }
    }
    
    def start_requests(self):
        url = f"https://movies.yahoo.com.tw/ajax/in_theater_movies"
        yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        item = MovieId()
        movies = json.loads(response.text)
        for key, value in movies.items():
            item["id"] = key
            item["title"] = value
            yield (item)

    
