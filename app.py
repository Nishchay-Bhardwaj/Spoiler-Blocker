from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import torch

# Initialize FastAPI
app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, you can modify this to allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Define the path to your model directory
model_dir = r"C:\Users\91740\Downloads\saved_model-20241112T170345Z-001\saved_model"

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_dir)
model = AutoModelForSequenceClassification.from_pretrained(model_dir)

# Define the request body model for incoming requests
class TextRequest(BaseModel):
    text: str

@app.post("/predict")
async def predict_spoiler(request: TextRequest):
    try:
        # Tokenize the input text
        inputs = tokenizer(request.text, return_tensors="pt", truncation=True, padding=True)

        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
            predictions = torch.softmax(outputs.logits, dim=1)

            # Assume '1' corresponds to 'spoiler'
            spoiler_prob = predictions[0][1].item()
            return {"is_spoiler": spoiler_prob > 0.5, "probability": spoiler_prob}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# This line will be used when running the API with Uvicorn
# uvicorn app:app --reload
