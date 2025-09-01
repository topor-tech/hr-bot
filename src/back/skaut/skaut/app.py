from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from skaut.api.files.upload import router as files_router
from skaut.api.preprocess.extract_cv import router as preprocess_router
    
app = FastAPI(title="Skaut API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello from Skaut API!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Routers
app.include_router(files_router)
app.include_router(preprocess_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
