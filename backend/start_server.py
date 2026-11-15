import uvicorn

if __name__ == "__main__":
    print("=" * 70)
    print("🚀 Starting AegisVote FastAPI Consortium Backend on http://127.0.0.1:8000")
    print("📖 Interactive Swagger API Documentation: http://127.0.0.1:8000/docs")
    print("📊 Alternative Redoc Documentation: http://127.0.0.1:8000/redoc")
    print("=" * 70)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

