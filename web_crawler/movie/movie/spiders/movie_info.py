import scrapy
import json
import re


from ..items import MovieInfo
from ..pipelines import Postgres


class MovieInfoSpider(scrapy.Spider):
    name = "movie_info"
    allowed_domains = ["movies.yahoo.com.tw"]
    movie_id = []
    custom_settings = {
        'ITEM_PIPELINES': {
            'movie.pipelines.MovieInfoPipeline': 400
        }
    }

    def start_requests(self):
        self.connection = Postgres.connect(Postgres)
        self.cur = self.connection.cursor()
        self.cur.execute("SELECT id FROM movie;")

        links = self.cur.fetchall()
        for i in links:     
            self.movie_id.append(i[0])

        for id in self.movie_id:
            url = f"https://movies.yahoo.com.tw/movieinfo_main/{id}"
            yield scrapy.Request(url=url, callback=self.parse, meta={"id": id})

    def parse(self, response):
        item = MovieInfo()

        item["movie_id"] = response.meta["id"]

        info_list = response.css("div.movie_intro_info_r")
        item["title"] = info_list.css("h1::text").get()
        item["title_en"] = info_list.css("h3::text").get()
        
        info = "".join(info_list.css("span").getall())
        item["release_date"] = re.search("上映日期：(.*?)</span>", info).group(1)
        item["runtime"] = re.search(f"片\u3000\u3000長：(.*?)</span>", info).group(1)
        item["distributor"] = re.search("發行公司：(.*?)</span>", info).group(1)
        
        a = re.search("IMDb分數：(.*?)</span>", info)    
        item["imdb_score"] = a.group(1) if a else 0.0

        item["img"] = response.css("div.movie_intro_foto >img::attr(src)").get()

        yield (item)
