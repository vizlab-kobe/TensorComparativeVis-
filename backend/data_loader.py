import numpy as np
from typing import Tuple, List
from pathlib import Path


class DataLoader:
    """Loader for HPC tensor data files."""
    
    def __init__(self, data_dir: str = "../data/processed/HPC"):
        self.data_dir = Path(data_dir)
        self._original_data = None
        self._time_axis = None
        self._tensor_X = None
        self._tensor_y = None
    
    def load_all(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Load all data files and return them."""
        self._original_data = np.load(self.data_dir / "HPC_time_original.npy")
        self._time_axis = np.load(self.data_dir / "HPC_time_axis.npy")
        self._tensor_X = np.load(self.data_dir / "HPC_tensor_X.npy")
        self._tensor_y = np.load(self.data_dir / "HPC_tensor_y.npy")
        
        return self._original_data, self._time_axis, self._tensor_X, self._tensor_y
    
    @property
    def original_data(self) -> np.ndarray:
        if self._original_data is None:
            self.load_all()
        return self._original_data
    
    @property
    def time_axis(self) -> np.ndarray:
        if self._time_axis is None:
            self.load_all()
        return self._time_axis
    
    @property
    def tensor_X(self) -> np.ndarray:
        if self._tensor_X is None:
            self.load_all()
        return self._tensor_X
    
    @property
    def tensor_y(self) -> np.ndarray:
        if self._tensor_y is None:
            self.load_all()
        return self._tensor_y
    
    @property
    def shape(self) -> Tuple[int, int, int]:
        """Return (T, S, V) shape of tensor."""
        return self.tensor_X.shape
    
    @property
    def n_classes(self) -> int:
        """Return number of unique classes."""
        return len(np.unique(self.tensor_y))


# Variables for the HPC dataset
VARIABLES = ['AirIn', 'AirOut', 'CPU', 'Water']

# Rack numbers (excluding 3, 8, 13, 18, etc.)
RACK_NUMBERS = [i for i in range(1, 46) if i % 10 != 3 and i % 10 != 8]

# Grid configuration
GRID_SHAPE = (36, 24)
HEATMAP_COLS = 24


def index_to_label(vector_index: int) -> str:
    """Convert heatmap index to supercomputer rack label."""
    col_index = vector_index % HEATMAP_COLS
    row_index = vector_index // HEATMAP_COLS
    letter = chr(ord('A') + col_index)
    return f"{letter}{RACK_NUMBERS[row_index]}"


def label_to_index(label: str) -> int:
    """Convert rack label to heatmap index."""
    letter = label[0]
    number = int(label[1:])
    col_index = ord(letter) - ord('A')
    row_index = RACK_NUMBERS.index(number)
    return row_index * HEATMAP_COLS + col_index
