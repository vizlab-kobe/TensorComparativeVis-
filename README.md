# HPC Dashboard

A modern tensor data visualization dashboard for High-Performance Computing (HPC) system analysis using TULCA (Tensor ULCA) dimensionality reduction and AI-powered interpretation.

## Features

- **TULCA + PaCMAP Dimensionality Reduction**: Visualize high-dimensional tensor data in 2D
- **Interactive Cluster Selection**: Lasso-select points to compare clusters (Red vs Blue)
- **Feature Importance Ranking**: Horizontal bar chart showing which features differentiate clusters
- **Contribution Heatmap**: Spatial distribution of feature importance across 864 racks
- **Time Series Comparison**: Compare cluster values over time with tooltips
- **AI Interpretation**: Gemini-powered analysis with structured output (Key Findings, Statistical Summary, Caveats)
- **Analysis History**: Save and compare multiple analyses
- **Screenshot Export**: Export any visualization panel as PNG

## Tech Stack

- **Frontend**: React 19 + TypeScript, Chakra UI, D3.js, Zustand
- **Backend**: FastAPI + Python 3.9+
- **AI**: Google Gemini API (gemini-2.5-flash)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+

### Data Setup

Place HPC tensor data files in `data/processed/HPC/`:

```
data/processed/HPC/
├── HPC_tensor_X.npy      # Standardized tensor (T, S, V)
├── HPC_tensor_y.npy      # Class labels
├── HPC_time_axis.npy     # Timestamps
└── HPC_time_original.npy # Original values
```

### Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set Gemini API key (optional, for AI features)
# Create .env file with: GEMINI_API_KEY=your_key_here

# Run the server
uvicorn main:app --reload --port 8000
```

API: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App: `http://localhost:5173`

## Project Structure

```
hpc-dashboard/
├── backend/
│   ├── main.py           # FastAPI endpoints
│   ├── tulca.py          # TULCA algorithm
│   ├── analysis.py       # Feature importance analysis
│   ├── interpreter.py    # Gemini AI interpretation
│   ├── data_loader.py    # Data loading utilities
│   └── models.py         # Pydantic schemas
│
├── frontend/src/
│   ├── App.tsx           # Main application
│   ├── components/       # React components
│   │   ├── ScatterPlot   # 2D embedding with lasso selection
│   │   ├── FeatureRanking# Horizontal bar chart
│   │   ├── Heatmap       # Contribution heatmap
│   │   ├── TimeSeriesPlot# Time series comparison
│   │   └── AIInterpretation # AI summary panel
│   ├── store/            # Zustand state management
│   └── api/              # API client
│
└── data/                 # HPC tensor data (gitignored)
```

## Usage

1. **Set Class Weights**: Adjust w_tg, w_bw, w_bg sliders in sidebar
2. **Execute Analysis**: Click "Execute Analysis" to compute embedding
3. **Select Clusters**: Use lasso tool to select Red (Cluster 1) and Blue (Cluster 2)
4. **View Results**: Analysis runs automatically when both clusters are selected
5. **Save Analysis**: Click "Save" to store current analysis for comparison
6. **Compare**: Select 2 saved analyses and click "Compare" for AI-generated comparison

## License

MIT
