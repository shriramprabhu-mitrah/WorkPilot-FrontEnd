import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectDetail, SprintDetail } from '@/src/types/project';

interface ProjectState {
  selectedProject: (Project & Partial<ProjectDetail>) | null;
  selectedSprint: SprintDetail | null; // null = All Sprints
  sprints: SprintDetail[];
  isLoading: boolean;
  projectRole: string | null;
  projectRoleId: string | null;
}

const initialState: ProjectState = {
  selectedProject: null,
  selectedSprint: null,
  sprints: [],
  isLoading: false,
  projectRole: null,
  projectRoleId: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setSelectedProject: (state, action: PayloadAction<Project & Partial<ProjectDetail>>) => {
      state.selectedProject = action.payload;
      state.selectedSprint = null;
      state.sprints = [];
      state.projectRole = null;
      state.projectRoleId = null;
    },
    clearSelectedProject: (state) => {
      state.selectedProject = null;
      state.selectedSprint = null;
      state.sprints = [];
      state.projectRole = null;
      state.projectRoleId = null;
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
    setProjectRole: (state, action: PayloadAction<{ role: string; roleId: string }>) => {
      state.projectRole = action.payload.role;
      state.projectRoleId = action.payload.roleId;
    },
  },
});

export const {
  setSelectedProject,
  clearSelectedProject,
  setProjectLoading,
  setSelectedSprint,
  setSprints,
  setProjectRole,
} = projectSlice.actions;

export default projectSlice.reducer;
