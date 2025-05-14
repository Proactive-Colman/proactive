import os
import time
import asyncio
import threading
import requests
from fastapi import FastAPI, HTTPException
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException

app = FastAPI()
BACKEND_URL = os.getenv('BACKEND_URL', 'http://backend:3000')

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    return webdriver.Chrome(options=options)

def execute_test(test):
    driver = None
    start_time = time.time()
    
    try:
        driver = setup_driver()
        driver.get(test['startUrl'])
        
        for step in test['steps']:
            # Wait for page load
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Execute step (simplified - you might want to parse and execute more complex steps)
            if step.startswith('click'):
                element = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, step.split('click ')[1]))
                )
                element.click()
            elif step.startswith('type'):
                selector, text = step.split('type ')[1].split(' ', 1)
                element = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                element.send_keys(text)
        
        execution_time = time.time() - start_time
        return {
            'status': 'completed',
            'executionTime': execution_time
        }
        
    except (TimeoutException, WebDriverException) as e:
        execution_time = time.time() - start_time
        return {
            'status': 'failed',
            'executionTime': execution_time,
            'error': str(e)
        }
        
    finally:
        if driver:
            driver.quit()

async def test_execution_loop():
    while True:
        try:
            # Fetch all tests
            response = requests.get(f'{BACKEND_URL}/tests')
            tests = response.json()
            
            for test in tests:
                if test['status'] == 'pending':
                    # Update status to running
                    requests.put(
                        f'{BACKEND_URL}/tests/{test["_id"]}/status',
                        json={'status': 'running'}
                    )
                    
                    # Execute test
                    result = execute_test(test)
                    
                    # Update test status
                    requests.put(
                        f'{BACKEND_URL}/tests/{test["_id"]}/status',
                        json=result
                    )
            
            # Wait before next iteration
            await asyncio.sleep(5)
            
        except Exception as e:
            print(f"Error in main loop: {e}")
            await asyncio.sleep(5)

@app.on_event("startup")
async def startup_event():
    # Start the test execution loop in a separate thread
    loop = asyncio.get_event_loop()
    loop.create_task(test_execution_loop())

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/execute/{test_id}")
async def execute_specific_test(test_id: str):
    try:
        # Get test from backend
        response = requests.get(f'{BACKEND_URL}/tests/{test_id}')
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Test not found")
        
        test = response.json()
        
        # Update status to running
        requests.put(
            f'{BACKEND_URL}/tests/{test_id}/status',
            json={'status': 'running'}
        )
        
        # Execute test
        result = execute_test(test)
        
        # Update test status
        requests.put(
            f'{BACKEND_URL}/tests/{test_id}/status',
            json=result
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 