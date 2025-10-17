from supabase import create_client
import os
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)
def insert_log(table, record):
    supabase.table(table).insert(record).execute()
