using Microsoft.OpenApi.Models;

public class QdrantSwaggerDocumentFilter : Swashbuckle.AspNetCore.SwaggerGen.IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, Swashbuckle.AspNetCore.SwaggerGen.DocumentFilterContext context)
    {
        // Example Qdrant endpoint in Swagger
        swaggerDoc.Paths.Add("/qdrant/collections", new OpenApiPathItem
        {
            Description = "Get list of Qdrant collections (proxied via YARP)",
            Operations =
            {
                [OperationType.Get] = new OpenApiOperation
                {
                    Summary = "List Qdrant Collections",
                    Responses = new OpenApiResponses
                    {
                        { "200", new OpenApiResponse { Description = "OK" } }
                    }
                }
            }
        });

        swaggerDoc.Paths.Add("/qdrant/collections/{name}", new OpenApiPathItem
        {
            Description = "Get details of a specific Qdrant collection",
            Operations =
            {
                [OperationType.Get] = new OpenApiOperation
                {
                    Summary = "Get Qdrant Collection",
                    Parameters =
                    {
                        new OpenApiParameter
                        {
                            Name = "name",
                            In = ParameterLocation.Path,
                            Required = true,
                            Schema = new OpenApiSchema { Type = "string" }
                        }
                    },
                    Responses = new OpenApiResponses
                    {
                        { "200", new OpenApiResponse { Description = "OK" } }
                    }
                }
            }
        });
    }
}
