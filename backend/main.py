from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from google import genai
import tempfile

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://resume-grader-react.vercel.app"
        ],
    allow_methods=["*"],
    allow_headers=["*"],
)

def grade_resume(pdf_path):
    uploaded_file = client.files.upload(file=pdf_path)

    prompt = """
    You are an expert ATS (Applicant Tracking System) resume grader.
    
    Analyze the provided resume and return your response in exactly this format:

    SCORE: [number out of 100]

    ISSUES:
    - [issue 1]
    - [issue 2]
    (list as many as needed)
    """

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=[uploaded_file, prompt]
    )

    return response.text

@app.post("/grade-resume")
async def grade_resume_endpoint(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    result = grade_resume(tmp_path)
    os.unlink(tmp_path)
    
    return {"result": result}