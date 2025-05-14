import os
import time
import asyncio
import threading
import requests
from fastapi import FastAPI, HTTPException
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from pydantic import BaseModel
from typing import List, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

app = FastAPI(
    title="Proactive Test Executor",
    description="Service for executing automated tests using Selenium",
    version="1.0.0",
    docs_url=None,  # Disable default docs
    redoc_url=None  # Disable default redoc
)

# Pydantic models for API documentation
class StepResult(BaseModel):
    name: str
    status: str
    duration: float
    error: Optional[str] = None

class TestResult(BaseModel):
    testId: str
    status: str
    executionTime: float
    steps: List[StepResult]
    error: Optional[str] = None

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Proactive Test Executor API",
        version="1.0.0",
        description="API for executing automated tests using Selenium",
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Custom Swagger UI endpoint
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Proactive Test Executor API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css",
    )

# OpenAPI JSON endpoint
@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_endpoint():
    return app.openapi()

BACKEND_URL = os.getenv('BACKEND_URL', 'http://backend:3000')

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    # Explicitly set the binary location for Chromium
    options.binary_location = "/usr/bin/chromium"  # or "/usr/bin/chromium-browser" if needed
    try:
        driver = webdriver.Chrome(
            service=Service("/usr/bin/chromedriver"),
            options=options
        )
    except Exception as e:
        # Try fallback paths for chromedriver if the above fails
        try:
            driver = webdriver.Chrome(
                service=Service("/usr/lib/chromium/chromedriver"),
                options=options
            )
        except Exception as e2:
            try:
                driver = webdriver.Chrome(
                    service=Service("/usr/bin/chromium-driver"),
                    options=options
                )
            except Exception as e3:
                raise RuntimeError(f"Failed to start Chromium WebDriver. Error 1: {e}. Error 2: {e2}. Error 3: {e3}")
    return driver

def execute_command(driver, command):
    """Execute a single Selenium command and return its result."""
    try:
        # Create a local context with the driver and By
        local_context = {
            'driver': driver,
            'By': By,
            'Keys': Keys,
            'WebDriverWait': WebDriverWait,
            'EC': EC
        }
        
        # Execute the command in the local context
        result = eval(command, {"__builtins__": {}}, local_context)
        return True
    except Exception as e:
        raise Exception(f"Failed to execute command '{command}': {str(e)}")

def execute_test(test):
    driver = None
    start_time = time.time()
    step_results = []
    
    # Initialize all steps with 'none' status
    for step in test['steps']:
        step_results.append({
            'name': step['name'],
            'status': 'none',
            'duration': 0,
            'error': None
        })
    
    try:
        driver = setup_driver()
        
        # Execute each step
        for i, step in enumerate(test['steps']):
            step_start_time = time.time()
            step_status = 'completed'
            step_error = None
            
            try:
                # Execute each command in the step
                for command in step['commands']:
                    execute_command(driver, command)
            except Exception as e:
                step_status = 'failed'
                step_error = str(e)
                raise e
            finally:
                step_duration = time.time() - step_start_time
                step_results[i] = {
                    'name': step['name'],
                    'status': step_status,
                    'duration': step_duration,
                    'error': step_error
                }
        
        execution_time = time.time() - start_time
        return {
            'testId': test['_id'],
            'status': 'completed',
            'executionTime': execution_time,
            'steps': step_results
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        return {
            'testId': test['_id'],
            'status': 'failed',
            'executionTime': execution_time,
            'error': str(e),
            'steps': step_results
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

@app.get("/health", 
    summary="Health Check",
    description="Check if the executor service is healthy",
    response_model=dict)
async def health_check():
    return {"status": "healthy"}

@app.post("/execute/{test_id}",
    summary="Execute Test",
    description="Execute a specific test by its ID",
    response_model=TestResult,
    responses={
        200: {
            "description": "Test execution completed",
            "model": TestResult
        },
        404: {
            "description": "Test not found"
        },
        500: {
            "description": "Internal server error"
        }
    })
async def execute_specific_test(test_id: str):
    try:
        # Get test from backend
        response = requests.get(f'{BACKEND_URL}/tests/{test_id}')
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Test not found")
        
        test = response.json()
        
        # Execute test
        result = execute_test(test)
        
        # Update test status in backend
        requests.put(
            f'{BACKEND_URL}/tests/{test_id}/status',
            json={
                'status': result['status'],
                'executionTime': result['executionTime'],
                'error': result.get('error')
            }
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 