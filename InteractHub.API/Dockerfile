# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy file csproj trước để restore
COPY InteractHub.API.csproj .
RUN dotnet restore InteractHub.API.csproj

# Copy toàn bộ source
COPY . .

# Build và publish
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "InteractHub.API.dll"]
