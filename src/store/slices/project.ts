import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectDetail } from '@/src/types/project';

interface ProjectState {
  selectedProject: (Project & Partial<ProjectDetail>) | null;
  isLoading: boolean;
}

const initialState: ProjectState = {
  selectedProject: null,
  isLoading: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProject: (state, action: PayloadAction<Project & Partial<ProjectDetail>>) => {
      state.selectedProject = action.payload;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
    },
    setProjectLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSelectedProject, clearSelectedProject, setProjectLoading } = projectSlice.actions;

export default projectSlice.reducer;
