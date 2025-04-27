
import pdfplumber
import google.generativeai as genai
import os

# Set the environment variable
genai.configure(api_key="AIzaSyCg9wgyjYklLr2x0V8HHmhG1tynnnL9K7Q")

# Function to extract text from PDF using pdfplumber
def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

# Function to get a summary from Gemini-pro API
def summarize_text(text):
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    response = model.generate_content([f"Please summarize the following text:\n\n{text}"])
    return response.text

# Function to question text using Gemini-pro API
def question_text(text, question):
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content([f"Please answer the following question based on the provided text:\n\nText: {text}\n\nQuestion: {question}"])
    return response.text

# Example usage
pdf_path = "C:/Users/monis/Downloads/leetcode1.pdf"  # Replace with the path to your PDF file

# Extract text from PDF
text = extract_text_from_pdf(pdf_path)

# Get a summary
summary = summarize_text(text)
print("Summary:\n", summary)

# Ask a question
question = "What are the main points discussed in this document?"
answer = question_text(text, question)
print("Answer:\n", answer)
