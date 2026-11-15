from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    PROJECT_NAME: str = "AegisVote - Privacy-Preserving E-Voting Infrastructure"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Tokens
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Consortium Organizations (Hyperledger Fabric 3-Org Model)
    ORGS: List[str] = ["EC_ORG1", "OBSERVER_ORG2", "CIVIL_SOCIETY_ORG3"]
    REQUIRED_ENDORSEMENTS: int = 2  # 2-of-3 endorsement policy
    
    # Crypto Settings
    PAILLIER_KEY_SIZE: int = 1024  # Fast for interactive demos; 2048 for high-security production
    THRESHOLD_T: int = 2
    THRESHOLD_N: int = 3
    
    # Dual-Mode Fabric Flag: True = Local Docker Fabric, False = High-Performance Cryptographic State Machine
    USE_EXTERNAL_FABRIC: bool = False
    FABRIC_GATEWAY_ENDPOINT: str = "localhost:7051"

    # Supabase External Cloud Database
    SUPABASE_URL: str = "https://daisefpwdrumoegrzuap.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhaXNlZnB3ZHJ1bW9lZ3J6dWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MTM5NTAsImV4cCI6MjExMDI4OTk1MH0.JnkXplS8QNvnZF_Q7N7blqljUCwmm08ogKJyXXgh7CY"


settings = Settings()
