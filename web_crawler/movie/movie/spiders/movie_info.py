import scrapy
import re
from ..items import MovieInfo
from ..pipelines import Postgres
from datetime import datetime
import boto3
from io import BytesIO
import requests
import os
from dotenv import load_dotenv

load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("S3_ACCESS_KEY_SECRET")


class MovieInfoSpider(scrapy.Spider):
    name = "movie_info"
    allowed_domains = ["www.atmovies.com.tw"]
    movie_id = []
    custom_settings = {"ITEM_PIPELINES": {"movie.pipelines.MovieInfoPipeline": 400}}

    def start_requests(self):
        self.connection = Postgres.connect(Postgres)
        self.cur = self.connection.cursor()
        self.cur.execute("SELECT id, premiere FROM movie;")
        rows = self.cur.fetchall()

        for id, is_premiere in rows:
            if is_premiere:
                self.movie_id.append(id)

        for id in self.movie_id:
            url = f"http://www.atmovies.com.tw/movie/{id}"
            yield scrapy.Request(url=url, callback=self.parse, meta={"id": id})

    def parse(self, response):
        item = MovieInfo()
        movie_id = response.meta["id"]
        item["movie_id"] = movie_id

        movie_title = response.css("div.filmTitle::text").getall()[1]
        title, title_en = movie_title.split(" ", 1)
        item["title"] = title.strip()
        item["title_en"] = title_en.strip()

        film_tag_block = response.css('[id="filmTagBlock"]')
        runtime_info = ",".join(film_tag_block.css("ul.runtime > li::text").getall())

        find_releasedate = re.search("上映日期：(.*?),", runtime_info).group(1)
        item["release_date"] = datetime.strptime(find_releasedate, "%Y/%m/%d").strftime(
            "%Y-%m-%d"
        )
        find_runtime = re.search("片長：(.*?),", runtime_info)
        item["runtime"] = find_runtime.group(1) if find_runtime else ""

        film_info = response.css('[id="filmCastDataBlock"]')

        item["director"] = film_info.css("ul:nth-child(1) > li > a::text").get().strip()

        if film_info.css("ul:nth-child(2) > li > a::text").get() == "IMDb":
            item["imdb"] = film_info.css("ul:nth-child(2) > li > a::attr(href)").get()
        else:
            item["imdb"] = ""

        img_url = film_tag_block.css("img::attr(src)").get()
        if img_url:
            item[
                "img"
            ] = f"https://team-up-bucket.s3.ap-southeast-1.amazonaws.com/image/movie_info/{movie_id}.jpg"
            s3 = boto3.client(
                "s3",
                aws_access_key_id=AWS_ACCESS_KEY_ID,
                aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            )
            bucket_name = "team-up-bucket"  # Replace with your S3 bucket name
            s3.upload_fileobj(
                BytesIO(requests.get(img_url).content),
                bucket_name,
                f"image/movie_info/{item['movie_id']}.jpg",
            )

        yield (item)
