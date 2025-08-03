FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["TicketSystem.API/TicketSystem.API.csproj", "TicketSystem.API/"]
RUN dotnet restore "TicketSystem.API/TicketSystem.API.csproj"
COPY . .
WORKDIR "/src/TicketSystem.API"
RUN dotnet build "TicketSystem.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TicketSystem.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "TicketSystem.API.dll"] 