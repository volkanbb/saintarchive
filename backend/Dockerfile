FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["ECommerce.API/ECommerce.API.csproj", "ECommerce.API/"]
COPY ["ECommerce.Application/ECommerce.Application.csproj", "ECommerce.Application/"]
COPY ["ECommerce.Domain/ECommerce.Domain.csproj", "ECommerce.Domain/"]
COPY ["ECommerce.Infrastructure/ECommerce.Infrastructure.csproj", "ECommerce.Infrastructure/"]
COPY ["ECommerce.Persistence/ECommerce.Persistence.csproj", "ECommerce.Persistence/"]

RUN dotnet restore "ECommerce.API/ECommerce.API.csproj"

COPY . .
WORKDIR "/src/ECommerce.API"
RUN dotnet publish "ECommerce.API.csproj" -c Release -o /app/publish

# mcr.microsoft.com/playwright/dotnet:v1.41.0-jammy includes ASP.NET Core runtime
FROM mcr.microsoft.com/playwright/dotnet:v1.58.0-jammy AS base
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .

# Set environment
ENV ASPNETCORE_URLS=http://+:8080
ENV DefaultConnection="Host=db;Database=ecommercedb;Username=admin;Password=password123"
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

ENTRYPOINT ["dotnet", "ECommerce.API.dll"]
