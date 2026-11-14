.PHONY: dev backend frontend test lint install

install:
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

backend:
	cd backend && uvicorn app.main:app --reload --port 8000

frontend:
	cd frontend && npm run dev

test:
	cd backend && pytest -q

lint:
	cd backend && ruff check .
	cd frontend && npm run lint

# Levanta los dos. En Windows, abre dos terminales y usa `make backend` y `make frontend`.
dev:
	@echo "Terminal 1: make backend   ->  http://localhost:8000/docs"
	@echo "Terminal 2: make frontend  ->  http://localhost:5173"
