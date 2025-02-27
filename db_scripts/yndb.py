from dotenv import load_dotenv
import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import pytz

load_dotenv()

DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_NAME = os.getenv('DB_NAME')
MONGO_DB_URL = os.getenv('MONGO_DB_URL')

db_config = {
    "host": DB_HOST,  
    "user": DB_USER,  
    "password": DB_PASSWORD, 
    "database": DB_NAME 
}

class DatabaseConnection:
    def __init__(self, host, user, password, database):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
        self.cursor = None

    def connect(self):
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            if self.connection.is_connected():
                self.cursor = self.connection.cursor(dictionary=True)  # Return results as dictionaries
                return True
        except Error as e:
            print(f"Error connecting to MySQL: {e}")
            return False

    def disconnect(self):
        if self.connection and self.connection.is_connected():
            if self.cursor:
                self.cursor.close()
            self.connection.close()

    def __enter__(self):
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.disconnect()


def fetch_news_by_date_range(db_connection, start_date, end_date):
    try:
        query = """
            SELECT 
                n.newskey,
                n.newsdate,
                n.buseid,
                t.code_name,
                n.gijaname,
                n.gijaid,
                n.delete,
                n.ref
            FROM newsinfo n
            LEFT JOIN t_code_detail t ON n.buseid = t.code 
            WHERE t.code_group = 'DEPART_TP'
            AND DATE(n.newsdate) BETWEEN %s AND %s
            ORDER BY n.newsdate DESC, n.newsmeun DESC
        """

        db_connection.cursor.execute(query, (start_date, end_date))
        results = db_connection.cursor.fetchall()
        return results

    except Error as e:
        print(f"Error executing query: {e}")
        return None


def get_all_articles_for_period(start_date, end_date):
    with DatabaseConnection(**db_config) as db_connection:
        yeongnam_news = fetch_news_by_date_range(db_connection, start_date, end_date)
        return yeongnam_news


# if __name__ == "__main__":
#     analysis_period_days = 2
#     end_date = datetime.now()
#     start_date = end_date - timedelta(analysis_period_days)

#     article_ids_to_process = get_all_articles_for_period(start_date, end_date)
#     print(article_ids_to_process)

