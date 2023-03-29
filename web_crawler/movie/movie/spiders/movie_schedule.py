import scrapy
import json
import re

import datetime
from bs4 import BeautifulSoup
from ..items import MovieSchedule
from ..pipelines import Postgres

# from scrapy.crawler import CrawlerProcess
# from scrapy.utils.project import get_project_settings


class MovieScheduleSpider(scrapy.Spider):
    name = "movie_schedule"
    allowed_domains = ["movies.yahoo.com.tw"]
    custom_settings = {
        'ITEM_PIPELINES': {
            'movie.pipelines.MovieSchedulePipeline': 400
    
        }
    }

    movie_id = []

    def start_requests(self):
        self.connection = Postgres.connect(Postgres)
        self.cur = self.connection.cursor()
        self.cur.execute("SELECT id FROM movie;")

        links = self.cur.fetchall()
        for i in links:     
            self.movie_id.append(i[0])

        today = datetime.datetime.today()
        date_list = [
            today,
            today + datetime.timedelta(days=1),
            today + datetime.timedelta(days=2),
        ]
        for id in self.movie_id:
            for date in date_list:
                url = f"https://movies.yahoo.com.tw/ajax/pc/get_schedule_by_movie?movie_id={id}&date={date.strftime('%Y-%m-%d')}"
                yield scrapy.Request(url=url, callback=self.parse, meta={'id':id})

    def parse(self, response):
        item = MovieSchedule()
        json_data = json.loads(response.text)

        soup = BeautifulSoup(json_data["view"], "lxml")
        html_element = soup.find_all(
            "ul", attrs={"data-theater_name": re.compile(".*")}
        )

        # html_element.find("ul", attrs={""})
        for li in html_element:
            theater = li.find("li", attrs={"class": "adds"})
            # print("電影院： {}".format(theater.find("a").text))
            info = li.find_all(class_="gabtn")
            print(info)

            for i in info:
                item["movie_id"] = response.meta["id"]
                # item["title"] = i["data-movie_title"]
                # item["theater"] = i["data-theater_schedules"].text

                a = re.search('id=(.*)">', str(theater.find("a")))
                item["theater_id"] = int(a.group(1))
                # item["date"] = i["data-movie_date"].replace(".", "-")
                item["date"] = i["value"].split(" ")[0]
                item["time"] = i["data-movie_time"]
                item["kind"] = i["data-movie_type"]
                yield (item)
# def main():
#     process = CrawlerProcess(get_project_settings())
#     process.crawl(MovieScheduleSpider)
#     process.start()

# if __name__ =="__main__":
#     main()
        