from fastapi import FastAPI, HTTPException
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import os
import tempfile

app = FastAPI()

BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:3000")

def setup_selenium():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

@app.post("/execute")
async def execute_test(test_id: str):
    try:
        # Get the Python file from backend
        response = requests.get(f"{BACKEND_URL}/api/tests/{test_id}/file")
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Test file not found")
        
        # Create a temporary file to store the Python script
        with tempfile.NamedTemporaryFile(suffix='.py', delete=False) as temp_file:
            temp_file.write(response.content)
            temp_file_path = temp_file.name
        
        try:
            # Setup Selenium
            driver = setup_selenium()
            
            # Execute the test file
            with open(temp_file_path, 'r') as file:
                exec(file.read())
            
            return {"status": "success", "message": "Test executed successfully"}
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
            
        finally:
            # Cleanup
            if 'driver' in locals():
                driver.quit()
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to communicate with backend: {str(e)}") 