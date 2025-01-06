declare module "swagger-ui-react" {
  import { ComponentType } from "react";

  type HttpMethod =
    | "get"
    | "put"
    | "post"
    | "delete"
    | "options"
    | "head"
    | "patch"
    | "trace";

  interface SwaggerUIProps {
    spec?: Record<string, unknown>;
    url?: string;
    layout?: "BaseLayout" | "StandaloneLayout";
    docExpansion?: "list" | "full" | "none";
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    plugins?: Array<{
      statePlugins?: Record<string, unknown>;
      components?: Record<string, ComponentType>;
      wrapComponents?: Record<string, ComponentType>;
      afterLoad?: (system: unknown) => void;
    }>;
    supportedSubmitMethods?: Array<HttpMethod>;
    requestInterceptor?: (req: Request) => Request | Promise<Request>;
    responseInterceptor?: (res: Response) => Response | Promise<Response>;
    showMutatedRequest?: boolean;
    showExtensions?: boolean;
    filter?: boolean | string | ((path: string, method: string) => boolean);
    validatorUrl?: string | null;
    oauth2RedirectUrl?: string;
    displayOperationId?: boolean;
    displayRequestDuration?: boolean;
    maxDisplayedTags?: number;
    deepLinking?: boolean;
    presets?: Array<{
      components?: Record<string, ComponentType>;
      state?: Record<string, unknown>;
      fn?: Record<string, CallableFunction>;
      rootInjects?: Record<string, unknown>;
    }>;
  }

  const SwaggerUI: ComponentType<SwaggerUIProps>;
  export default SwaggerUI;
}

declare module "swagger-jsdoc" {
  export interface SwaggerDefinition {
    openapi: string;
    info: {
      title: string;
      version: string;
      description?: string;
    };
    servers?: Array<{
      url: string;
      description?: string;
    }>;
    tags?: Array<{
      name: string;
      description?: string;
    }>;
    components?: {
      securitySchemes?: {
        [key: string]: {
          type: string;
          in: string;
          name: string;
          description?: string;
        };
      };
      schemas?: {
        [key: string]: {
          type: string;
          properties: {
            [key: string]: {
              type: string;
              description?: string;
            };
          };
        };
      };
    };
  }

  declare interface Options {
    definition: SwaggerDefinition;
    apis: string[];
  }

  function swaggerJsdoc(options: Options): object;
  export default swaggerJsdoc;
}
