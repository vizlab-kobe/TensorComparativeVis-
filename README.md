# HPC Dashboard

A modern tensor data visualization dashboard for High-Performance Computing (HPC) system analysis.

## Tech Stack

- **Frontend**: React + TypeScript, Chakra UI, D3.js
- **Backend**: FastAPI + Python
- **State Management**: Zustand
- **API Communication**: Axios

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- pip

### Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Features

- **TULCA + PaCMAP Dimensionality Reduction**: Visualize high-dimensional tensor data in 2D
- **Interactive Cluster Selection**: Brush select points to compare clusters
- **Feature Importance Ranking**: See which features differentiate clusters
- **Heatmap Visualization**: Spatial distribution of feature importance
- **Time Series Comparison**: Compare cluster values over time
- **AI Interpretation**: Gemini-powered analysis of cluster differences

## Project Structure

```
hpc-dashboard/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── tulca.py          # TULCA algorithm
│   ├── analysis.py       # Feature analysis
│   ├── interpreter.py    # AI interpretation
│   ├── data_loader.py    # Data loading
│   ├── models.py         # Pydantic schemas
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── App.tsx       # Main application
    │   ├── components/   # React components
    │   ├── store/        # Zustand state
    │   ├── api/          # API client
    │   └── types/        # TypeScript types
    └── package.json
```

## Environment Variables

Set `GEMINI_API_KEY` for AI interpretation features:

```bash
export GEMINI_API_KEY=your_api_key_here
```
