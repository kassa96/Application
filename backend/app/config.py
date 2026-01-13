import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path(__file__).resolve().parent.parent / '.env'  
load_dotenv(dotenv_path=env_path)

class TestSettings:
    DATABASE_URL = os.getenv('vps_container_DATABASE_URL')


test_settings = TestSettings()

