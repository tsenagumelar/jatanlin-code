FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY WServerApi.csproj ./
RUN dotnet nuget list source && \
    dotnet restore WServerApi.csproj \
      --disable-parallel \
      --verbosity minimal \
      --source https://api.nuget.org/v3/index.json \
      --ignore-failed-sources

COPY . ./
RUN dotnet publish WServerApi.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "WServerApi.dll"]
