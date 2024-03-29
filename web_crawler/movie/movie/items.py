import scrapy


class MovieId(scrapy.Item):
    id = scrapy.Field()
    title = scrapy.Field()


class MovieCity(scrapy.Item):
    id = scrapy.Field()
    name = scrapy.Field()


class MovieTheater(scrapy.Item):
    id = scrapy.Field()
    name = scrapy.Field()
    address = scrapy.Field()
    tel = scrapy.Field()
    city_id = scrapy.Field()


class MovieInfo(scrapy.Item):
    movie_id = scrapy.Field()
    title = scrapy.Field()
    title_en = scrapy.Field()
    release_date = scrapy.Field()
    runtime = scrapy.Field()
    director = scrapy.Field()
    imdb = scrapy.Field()
    img = scrapy.Field()


class MovieSchedule(scrapy.Item):
    movie_id = scrapy.Field()
    theater_id = scrapy.Field()
    date = scrapy.Field()
    time = scrapy.Field()
    kind = scrapy.Field()


class MovieInfoPage(scrapy.Item):
    id = scrapy.Field()
    title = scrapy.Field()
    title_en = scrapy.Field()
    release_date = scrapy.Field()
    intro = scrapy.Field()
    img = scrapy.Field()
