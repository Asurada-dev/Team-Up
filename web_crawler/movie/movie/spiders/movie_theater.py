import scrapy
from ..items import MovieTheater
class MovieTheaterSpider(scrapy.Spider):
    name = "movie_theater"
    allowed_domains = ["movies.yahoo.com.tw"]
    custom_settings = {
        'ITEM_PIPELINES': {
            'movie.pipelines.MovieTheaterPipeline': 400
        }
    }

    def start_requests(self):
        url = "https://movies.yahoo.com.tw/theater_list.html"
        yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):

        item = MovieTheater()

        city_list = response.css("div.l_box_inner > div")

        if len(city_list) > 0:
            for div in city_list:  #
                theater_list = div.css("ul > li")
                for li in theater_list:
                    item["name"] = li.css("div.name > a::text").get()
                    if item["name"]:
                        item["id"] = (
                            li.css("div.name > a::attr(href)").get().split("id=")[-1]
                        )
                        item["address"] = li.css("div.adds::text").get()
                        item["tel"] = li.css("div.tel::text").get()
                        item["city_id"] = div.css(
                            "div.theater_content::attr(data-area)"
                        ).get()

                        yield (item)
