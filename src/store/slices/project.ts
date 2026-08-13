import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectDetail, SprintDetail } from '@/src/types/project';

interface ProjectState {
  selectedProject: (Project & Partial<ProjectDetail>) | null;
  selectedSprint: SprintDetail | null; // null = All Sprints
  sprints: SprintDetail[];
  isLoading: boolean;
}

const initialState: ProjectState = {
  selectedProject: null,
  selectedSprint: null,
  sprints: [],
  isLoading: false,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProject: (state, action: PayloadAction<Project & Partial<ProjectDetail>>) => {
      state.selectedProject = action.payload;
      state.selectedSprint = null;
      state.sprints = [];
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
      state.selectedSprint = null;
      state.sprints = [];
    },
    setProjectLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSelectedSprint: (state, action: PayloadAction<SprintDetail | null>) => {
      state.selectedSprint = action.payload;
    },
    setSprints: (state, action: PayloadAction<SprintDetail[]>) => {
      state.sprints = action.payload;
    },
  },
});

export const { setSelectedProject, clearSelectedProject, setProjectLoading, setSelectedSprint, setSprints } = projectSlice.actions;

export default projectSlice.reducer;
