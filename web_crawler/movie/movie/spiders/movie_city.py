import scrapy
from ..items import MovieCity
class MovieCitySpider(scrapy.Spider):
    name = "movie_city"
    allowed_domains = ["movies.yahoo.com.tw"]
    custom_settings = {
        'ITEM_PIPELINES': {
            'movie.pipelines.MovieCityPipeline': 400
        }
    }

    def start_requests(self):
        url = "https://movies.yahoo.com.tw/theater_list.html"
        yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        item = MovieCity()

        city_list = response.css("div.l_box_inner > div")

        if len(city_list) > 0:
            for div in city_list:  #
                item["id"] = div.css(
                            "div.theater_content::attr(data-area)"
                        ).get()
                item["name"] = (
                            div.css("div.theater_top::text").get().strip()
                        )
                yield (item)
