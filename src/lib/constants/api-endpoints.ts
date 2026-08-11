interface EndpointBuilder {
  (...params: string[]): string;
  url: string;
  withParams: (params: Record<string, string>) => string;
}

const createEndpoint = (path: string): EndpointBuilder => {
  const builder = (...params: string[]): string => {
    let builtPath = path;

    // Replace path parameters like {userId} or :userId with actual values
    const bracketMatches = path.match(/\{([^}]{1,100})\}/g);
    const colonMatches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]{0,99})/g);

    // Handle {param} syntax
    if (bracketMatches && params.length > 0) {
      bracketMatches.forEach((match, index) => {
        if (params[index] !== undefined) {
          builtPath = builtPath.replace(match, params[index]);
        }
      });
    }

    // Handle :param syntax
    if (colonMatches && params.length > 0) {
      colonMatches.forEach((match, index) => {
        if (params[index] !== undefined) {
          builtPath = builtPath.replace(match, params[index]);
        }
      });
    }

    return builtPath;
  };

  // Named parameters method for better readability with multiple params
  builder.withParams = (params: Record<string, string>): string => {
    let builtPath = path;

    // Replace {paramName} syntax
    Object.entries(params).forEach(([key, value]) => {
      builtPath = builtPath.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
      builtPath = builtPath.replace(new RegExp(`:${key}\\b`, 'g'), value);
    });

    return builtPath;
  };

  builder.url = path;
  return builder;
};

const createQueryEndpoint = (path: string) => {
  return {
    get url() {
      return path;
    },

    withQuery: (params: Record<string, string | number | boolean>): string => {
      const queryString = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

      return queryString ? `${path}?${queryString}` : path;
    },

    withParams: (...pathParams: string[]) => {
      let builtPath = path;
      const bracketMatches = path.match(/\{([^}]{1,100})\}/g);
      const colonMatches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]{0,99})/g);

      // Handle {param} syntax
      if (bracketMatches && pathParams.length > 0) {
        bracketMatches.forEach((match, index) => {
          if (pathParams[index] !== undefined) {
            builtPath = builtPath.replace(match, pathParams[index]);
          }
        });
      }

      // Handle :param syntax
      if (colonMatches && pathParams.length > 0) {
        colonMatches.forEach((match, index) => {
          if (pathParams[index] !== undefined) {
            builtPath = builtPath.replace(match, pathParams[index]);
          }
        });
      }

      return {
        get url() {
          return builtPath;
        },
        withQuery: (params: Record<string, string | number | boolean>): string => {
          const queryString = Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(
              ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
            )
            .join('&');

          return queryString ? `${builtPath}?${queryString}` : builtPath;
        },
      };
    },

    withNamedParams: (params: Record<string, string>) => {
      let builtPath = path;

      // Replace both {paramName} and :paramName syntax
      Object.entries(params).forEach(([key, value]) => {
        builtPath = builtPath.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        builtPath = builtPath.replace(new RegExp(`:${key}\\b`, 'g'), value);
      });

      return {
        get url() {
          return builtPath;
        },
        withQuery: (queryParams: Record<string, string | number | boolean>): string => {
          const queryString = Object.entries(queryParams)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(
              ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
            )
            .join('&');

          return queryString ? `${builtPath}?${queryString}` : builtPath;
        },
      };
    },
  };
};

export const ApiEndpoints = {
  Sign: {
    signIn: createEndpoint('/auth/signin'),
    signUp: createEndpoint('/auth/signup'),
    logOut: createEndpoint('/auth/logout'),
    refresh: createEndpoint('/auth/refresh'),
    forgotPassword: createEndpoint('/auth/change-password'),
    passwordReset: createEndpoint('/auth/password-reset/request'),
    passwordConfirm: createEndpoint('/auth/password-reset/confirm'),
    verifyPassword: createEndpoint('/auth/verify-email'),
    resendEmail: createEndpoint('/auth/resend-verification-otp'),
    validateUser: createQueryEndpoint('/auth/validate'),
  },
  Organization: {
    createOrganization: createEndpoint('/organization/create'),
    inviteUsers: createEndpoint('/organization/invite'),
    updateOrganization: createEndpoint('/organization/update'),
    getOrganization: createEndpoint('/organization/get'),
    deleteOrganization: createEndpoint('/organization/delete'),
    getUsers: createQueryEndpoint('/organization/get-users'),
  },
  User: {
    userUpdate: createEndpoint('auth/update'),
    getUser: createQueryEndpoint('auth/me'),
  },
  Country: {
    getCountry: createEndpoint('/countries'),
  },
  Team: {
    getUsers: createQueryEndpoint('/organization/get-users'),
    removeUser: createEndpoint('/organization/remove-user/{user_id}'),
    updateRole: createEndpoint('/organization/user-role'),
    getUserById: createEndpoint('/auth/{id}'),
    getProject: createEndpoint('/project/user/{id}'),
  },
  Project: {
    createProject: createEndpoint('/project/create'),
    getProject: createQueryEndpoint('/project/get'),
    getProjectDetail: createEndpoint('/project/{projectId}/detail'),
    updateProject: createEndpoint('/project/update/{projectId}'),
    deleteProject: createEndpoint('/project/{projectId}'),
    addMembers: createEndpoint('/project/add-members'),
    getProjectMembers: createEndpoint('/project/members/{projectId}'),
    removeMember: createEndpoint('/project/{projectId}/member/{userId}'),
    updateProjectRole: createEndpoint('/project/{projectId}/member/{userId}'),
  },
  Sprint: {
    getSprints: createQueryEndpoint('/projects/{projectId}/sprint'),
    createSprint: createEndpoint('/projects/{projectId}/sprint'),
    getSprintById: createEndpoint('/projects/{projectId}/sprint/{sprintId}'),
    updateSprint: createEndpoint('/projects/{projectId}/sprint/{sprintId}'),
    deleteSprint: createEndpoint('/projects/{projectId}/sprint/{sprintId}'),
  },
  Task: {
    createTasks: createEndpoint('/projects/{projectId}/tasks'),
    getallTasks: createQueryEndpoint('/projects/{projectId}/tasks'),
    getTasks: createQueryEndpoint('/projects/{projectId}/tasks'),
    getTaskbyId: createEndpoint('/projects/{projectId}/tasks/{taskId}'),
    updateTaskbyId: createEndpoint('/projects/{projectId}/tasks/{taskId}'),
    cloneTask: createEndpoint('/projects/{projectId}/tasks/{taskId}/clone'),
    deleteTask: createEndpoint('/projects/{projectId}/tasks/{taskId}'),
    restoreTask: createEndpoint('/projects/{projectId}/tasks/{taskId}/restore'),
    bulkUpdate: createEndpoint('/projects/{projectId}/tasks/bulk'),
    getUserStory: createEndpoint('/projects/{projectId}/tasks/{taskId}'),
    allUserStories: createQueryEndpoint('/projects/{projectId}/tasks'),
    attachLabel: createEndpoint('/projects/{projectId}/tasks/{taskId}/labels/{labelId}'),
    removeLabel: createEndpoint('/projects/{projectId}/tasks/{taskId}/labels/{labelId}'),
  },
  Label: {
  getLabels: createQueryEndpoint('/projects/{projectId}/labels'),
  createLabel: createEndpoint('/projects/{projectId}/labels'),
  deleteLabel: createEndpoint('/projects/{projectId}/labels/{labelId}'),
  updateLabel: createEndpoint('/projects/{projectId}/labels/{labelId}'),
},

};

export type ApiEndpointType = typeof ApiEndpoints;
