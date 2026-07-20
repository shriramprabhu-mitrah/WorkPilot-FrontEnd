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
        signIn: createEndpoint("/auth/signin"),
        signUp: createEndpoint("/auth/signup"),
        logOut: createEndpoint("/auth/logout"),
        refresh: createEndpoint("/auth/refresh"),
        forgotPassword: createEndpoint("/auth/change-password"),
        passwordReset: createEndpoint("/auth/password-reset/request"),
        passwordConfirm:createEndpoint("/auth/password-reset/confirm"),
        userUpdate: createEndpoint("auth/update")
    }
} 

export type ApiEndpointType= typeof ApiEndpoints