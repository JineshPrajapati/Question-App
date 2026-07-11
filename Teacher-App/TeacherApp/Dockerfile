# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy only .sln and project files first (improves caching)
COPY TeacherApp.sln ./
COPY TeacherApp/*.csproj TeacherApp/
COPY TeacherApp.Infrastructure/*.csproj TeacherApp.Infrastructure/
COPY TeacherApp.Modules.Account/*.csproj TeacherApp.Modules.Account/
COPY TeacherApp.Modules.Admin/*.csproj TeacherApp.Modules.Admin/
COPY TeacherApp.Modules.Email/*.csproj TeacherApp.Modules.Email/
COPY TeacherApp.Modules.Entities/*.csproj TeacherApp.Modules.Entities/
COPY TeacherApp.Modules.Helper/*.csproj TeacherApp.Modules.Helper/
COPY TeacherApp.Modules.KnowledgeBase/*.csproj TeacherApp.Modules.KnowledgeBase/
COPY TeacherApp.Modules.LessonPlan/*.csproj TeacherApp.Modules.LessonPlan/
COPY TeacherApp.Modules.Mapper/*.csproj TeacherApp.Modules.Mapper/
COPY TeacherApp.Modules.Repositories/*.csproj TeacherApp.Modules.Repositories/

# Restore dependencies
RUN dotnet restore TeacherApp.sln

# Copy the rest of the source code
COPY . .

# Publish the app
RUN dotnet publish TeacherApp/TeacherApp.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TeacherApp.dll"]
