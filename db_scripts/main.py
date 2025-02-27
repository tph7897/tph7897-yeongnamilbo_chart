from datetime import timedelta, datetime
import yndb
import mongo_db


if __name__ == "__main__":
        analysis_period_days = 7
        end_date = datetime.now()
        start_date = end_date - timedelta(analysis_period_days)

        articles_data_snapshot = yndb.get_all_articles_for_period(start_date, end_date)
        result = mongo_db.handle_article_batch(articles_data_snapshot)
        print(result)