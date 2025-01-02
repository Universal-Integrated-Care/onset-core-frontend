// app/lib/swagger.ts

import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Clinic Management API Documentation",
      version: "1.0.0",
      description: "API documentation for the Clinic Management System",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-production-domain.com"
            : "http://localhost:3000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "Authentication and session management endpoints",
      },
      {
        name: "Appointments",
        description: "Appointment management endpoints",
      },
      {
        name: "Practitioners",
        description: "Practitioner management endpoints",
      },
      {
        name: "Clinics",
        description: "Clinic management endpoints",
      },
      {
        name: "Patients",
        description: "Patient management endpoints",
      },
      {
        name: "Availability",
        description: "Practitioner availability management",
      },
      {
        name: "Enums",
        description: "Enumeration value endpoints",
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "session_token",
          description: "Session-based authentication",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Success message",
            },
          },
        },
      },
    },
  },
  apis: ["./app/api/**/*.ts", "./app/api/**/route.ts"],
};

const specs = swaggerJsdoc(options);
export default specs;
