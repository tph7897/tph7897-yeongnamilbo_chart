import pymongo
import os
from dotenv import load_dotenv
import datetime
import pytz


load_dotenv()
MONGO_CONNECTOR = os.getenv('MONGO_DB_URL')


client = pymongo.MongoClient(MONGO_CONNECTOR)
database = client["yeongnam-visits"]
collection = database["articles"]


def check_for_entry(article):
    return collection.find_one({"newskey": article["newskey"]}) is not None


def add_entry_for_article(article, snapshot_timestamp):
    article_to_insert = article.copy() 
    article_to_insert["deleted"] = False
    
    article_to_insert["visits"] = [{
        "datetime": snapshot_timestamp,
        "visits": article_to_insert.pop("ref", 0)  
    }]
    
    return collection.insert_one(article_to_insert)


def update_visitors(article, snapshot_timestamp):
    existing_article = collection.find_one({"newskey": article["newskey"]})

    if not existing_article:
        return None
    
    visits_list = existing_article.get("visits", [])
    if any(entry["datetime"].date() == snapshot_timestamp.date() for entry in visits_list):
        return None

    new_visit = {"datetime": snapshot_timestamp, "visits": article["ref"]}

    return collection.update_one(
        {"newskey": article["newskey"]},
        {"$push": {"visits": new_visit}}
    )


def update_deletion(article):
    return collection.update_one(
        {"newskey": article["newskey"]},
        {"$set": {"deleted": True}}
    )


def handle_article_batch(article_data_snapshot):
    snapshot_timestamp = datetime.datetime.today()

    inserted_count = 0
    modified_count = 0
    deleted_count = 0

    for index, article in enumerate(article_data_snapshot, start=1):
        print(f"Processing article {index} / {len(article_data_snapshot)}")

        if check_for_entry(article):
            result = update_visitors(article, snapshot_timestamp)
            if result and result.modified_count > 0:
                modified_count += 1
        else:
            result = add_entry_for_article(article, snapshot_timestamp)
            if result and result.inserted_id:
                inserted_count += 1

        if article.get('delete', 0) == 1:
            result = update_deletion(article)
            if result and result.modified_count > 0:
                deleted_count += 1

    return {
        "inserted": inserted_count,
        "modified": modified_count,
        "deleted": deleted_count
    }
